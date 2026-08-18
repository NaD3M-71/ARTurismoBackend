const Ciudades = require('../models/Ciudades.js');
const Clientes = require('../models/Clientes.js');
const { unlink } = require('fs');
const multer = require('multer');
const fs = require('fs');
const { nanoid } = require('nanoid');
const path = require('path');

function sanitizarNombre(str) {
    return (str || '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .trim();
}

function getExt(mimetype) {
    const ext = mimetype.split('/')[1];
    return ext === 'jpeg' ? 'jpg' : ext;
}

// config de multer
const configuracionMulter = {
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '..', 'uploads'));
        },
        filename: (req, file, cb) => {
            cb(null, `${nanoid()}.${getExt(file.mimetype)}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'))
        }
    }
}

// Pasar la configuración y el campo
const upload = multer(configuracionMulter).single('imagen');

// Subir archivo
exports.subirArchivo = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            res.json({ mensaje: error })
        }
        return next();
    })
}


// agrega una nueva ciudad
exports.agregarCiudad = async (req, res, next) => {
    const ciudad = new Ciudades(req.body);

    try {
        if (req.file) {
            const ext = getExt(req.file.mimetype);
            const nombreCiudad = sanitizarNombre(req.body.nombre);
            const nuevoNombre = `Banner-${nombreCiudad}.${ext}`;
            const carpeta = path.join(__dirname, '..', 'uploads');
            fs.renameSync(path.join(carpeta, req.file.filename), path.join(carpeta, nuevoNombre));
            ciudad.imagen = nuevoNombre;
        }
        await ciudad.save();
        res.json({ mensaje: 'Ciudad agregada correctamente' })
    } catch (error) {
        console.log(error);
        next();
    }
}

exports.mostrarCiudades = async (req, res) => {
    try {
        const ciudades = await Ciudades.find({});
        res.json(ciudades)

    } catch (error) {
        console.log(error);
        next();
    }
}

exports.mostrarCiudad = async (req, res) => {
    try {
        const ciudad = await Ciudades.findById(req.params.ciudadId);
        if (!ciudad) {
            return res.status(404).json({ mensaje: 'No se encuentra esta ciudad' });
        }
        res.json(ciudad);
    } catch (error) {
        return res.status(404).json({ mensaje: 'No se encuentra esta ciudad' });
    }
}

exports.buscarCiudad = async (req, res, next) => {
    try {
        const { query } = req.params;
        const ciudad = await Ciudades.find({ nombre: new RegExp(query, 'i') });
        res.json(ciudad);
    } catch (error) {
        console.log(error);
        next();
    }
}


exports.actualizarCiudad = async (req, res, next) => {
    try {
        let ciudadAnterior = await Ciudades.findById(req.params.idCiudad);
        let nuevaCiudad = req.body;

        if (req.file) {
            const ext = getExt(req.file.mimetype);
            const nombreCiudad = sanitizarNombre(req.body.nombre || ciudadAnterior.nombre);
            const nuevoNombre = `Banner-${nombreCiudad}.${ext}`;
            const carpeta = path.join(__dirname, '..', 'uploads');

            // Borrar imagen anterior
            const imagenAnteriorPath = path.join(carpeta, ciudadAnterior.imagen);
            unlink(imagenAnteriorPath, (error) => {
                if (error) console.log(error);
            });

            // Renombrar nueva imagen
            fs.renameSync(path.join(carpeta, req.file.filename), path.join(carpeta, nuevoNombre));
            nuevaCiudad.imagen = nuevoNombre;
        } else {
            nuevaCiudad.imagen = ciudadAnterior.imagen;
        }

        let ciudad = await Ciudades.findOneAndUpdate({ _id: req.params.idCiudad }, nuevaCiudad, {
            new: true,
        });

        await res.json({ mensaje: 'Se ha actualizado la informacion de esta ciudad', ciudad })

    } catch (error) {
        console.log(error);
        next();
    }

}


// Eliminar Ciudad (y en cascada sus proveedores/clientes asociados)
exports.eliminarCiudad = async (req, res, next) => {
    try {
        const ciudad = await Ciudades.findById(req.params.idCiudad);
        if (!ciudad) {
            return res.status(404).json({ mensaje: 'No se encuentra esta ciudad' });
        }

        const carpeta = path.join(__dirname, '..', 'uploads');

        // Se busca por ciudad_id o por nombre, por compatibilidad con proveedores
        // cargados antes de que existiera la relación por id.
        const proveedores = await Clientes.find({
            $or: [
                { ciudad_id: ciudad._id },
                { ciudad: ciudad.nombre }
            ]
        });

        // Borrar las imágenes de cada proveedor
        proveedores.forEach(proveedor => {
            const imagenes = Array.isArray(proveedor.imagen)
                ? proveedor.imagen
                : (proveedor.imagen ? [proveedor.imagen] : []);

            imagenes.forEach(imagen => {
                const imagenPath = path.isAbsolute(imagen) ? imagen : path.join(carpeta, imagen);
                unlink(imagenPath, (error) => {
                    if (error) console.log(error);
                });
            });
        });

        if (proveedores.length > 0) {
            await Clientes.deleteMany({
                _id: { $in: proveedores.map(p => p._id) }
            });
        }

        // Borrar la imagen (banner) de la ciudad
        if (ciudad.imagen) {
            unlink(path.join(carpeta, ciudad.imagen), (error) => {
                if (error) console.log(error);
            });
        }

        await Ciudades.findByIdAndDelete(ciudad._id);

        res.json({
            mensaje: 'Ciudad eliminada correctamente, junto con sus proveedores asociados',
            proveedoresEliminados: proveedores.length
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al eliminar la ciudad' });
    }
}
