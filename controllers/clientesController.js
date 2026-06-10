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

// Busca el mayor número de foto ya existente para este proveedor/ciudad y devuelve el siguiente
function siguienteNumero(imagenes, nombre, ciudad) {
    const pattern = new RegExp(`^${nombre}-${ciudad}-(\\d+)\\..+$`);
    const nums = imagenes
        .map(img => { const m = pattern.exec(img); return m ? parseInt(m[1]) : 0; })
        .filter(n => n > 0);
    return nums.length > 0 ? Math.max(...nums) + 1 : 1;
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
        if (['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'));
        }
    }
}

// Pasar la configuración y el campo
const upload = multer(configuracionMulter).array('imagen', 5);

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
exports.agregarCliente = async (req, res, next) => {
    const cliente = new Clientes(req.body);
    console.log(cliente);

    try {
        if (req.files && req.files.length > 0) {
            const nombre = sanitizarNombre(req.body.nombre);
            const ciudad = sanitizarNombre(req.body.ciudad);
            const carpeta = path.join(__dirname, '..', 'uploads');

            cliente.imagen = req.files.map((file, i) => {
                const nuevoNombre = `${nombre}-${ciudad}-${i + 1}.${getExt(file.mimetype)}`;
                fs.renameSync(path.join(carpeta, file.filename), path.join(carpeta, nuevoNombre));
                return nuevoNombre;
            });
        }

        await cliente.save();
        res.json({ mensaje: 'Cliente agregado correctamente' });

    } catch (error) {
        console.log(error);
        next();
    }
}

const TIER_ORDER = [
    { case: { $eq: ["$tier", "III"] }, then: 0 },
    { case: { $eq: ["$tier", "II"] }, then: 1 },
    { case: { $eq: ["$tier", "I"] }, then: 2 },
];

exports.mostrarClientes = async (req, res) => {
    try {
        const clientes = await Clientes.aggregate([
            { $addFields: { tierOrder: { $switch: { branches: TIER_ORDER, default: 3 } } } },
            { $sort: { tierOrder: 1 } },
            { $project: { tierOrder: 0 } }
        ]);
        res.json(clientes);
    } catch (error) {
        console.log(error);
    }
}

exports.mostrarClientesPorCiudad = async (req, res) => {
    try {
        const ciudadNombre = req.params.ciudadNombre;
        const clientes = await Clientes.aggregate([
            { $match: { ciudad: ciudadNombre } },
            { $addFields: { tierOrder: { $switch: { branches: TIER_ORDER, default: 3 } } } },
            { $sort: { tierOrder: 1 } },
            { $project: { tierOrder: 0 } }
        ]);
        res.json(clientes);
    } catch (error) {
        console.log(error);
    }
}

exports.mostrarCliente = async (req, res) => {
    try {
        const cliente = await Clientes.findById(req.params.idCliente);
        if (!cliente) {
            return res.status(404).json({ mensaje: 'No se encuentra este cliente' });
        }
        res.json(cliente);
    } catch (error) {
        return res.status(404).json({ mensaje: 'No se encuentra este cliente' });
    }
}

exports.buscarCliente = async (req, res, next) => {
    try {
        const { query } = req.params;
        const cliente = await Clientes.find({ nombre: new RegExp(query, 'i') });
        res.json(cliente);
    } catch (error) {
        console.log(error);
        next();
    }
}


exports.actualizarCliente = async (req, res, next) => {
    try {
        const clienteAnterior = await Clientes.findById(req.params.idCliente);
        if (!clienteAnterior) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        const nuevoCliente = req.body;
        let imagenes = clienteAnterior.imagen || [];

        if (req.files && req.files.length > 0) {
            const nombre = sanitizarNombre(req.body.nombre || clienteAnterior.nombre);
            const ciudad = sanitizarNombre(req.body.ciudad || clienteAnterior.ciudad);
            const carpeta = path.join(__dirname, '..', 'uploads');
            let nextNum = siguienteNumero(imagenes, nombre, ciudad);

            const nuevasImagenes = req.files.map((file) => {
                const nuevoNombre = `${nombre}-${ciudad}-${nextNum++}.${getExt(file.mimetype)}`;
                fs.renameSync(path.join(carpeta, file.filename), path.join(carpeta, nuevoNombre));
                return nuevoNombre;
            });
            imagenes = [...imagenes, ...nuevasImagenes];
        }

        nuevoCliente.imagen = imagenes;

        const cliente = await Clientes.findByIdAndUpdate(
            req.params.idCliente,
            nuevoCliente,
            { new: true }
        );

        res.json({
            mensaje: 'Cliente actualizado correctamente',
            cliente
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};


exports.eliminarCliente = async (req, res, next) => {
    try {
        const cliente = await Clientes.findById(req.params.idCliente);
        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        if (cliente.imagen) {
            const imagenes = Array.isArray(cliente.imagen) ? cliente.imagen : [cliente.imagen];

            imagenes.forEach(imagen => {
                let imagenPath = imagen;

                if (!path.isAbsolute(imagen)) {
                    imagenPath = path.join(__dirname, '..', 'uploads', imagen);
                }

                if (fs.existsSync(imagenPath)) {
                    fs.unlink(imagenPath, (error) => {
                        if (error) {
                            console.error(`Error al eliminar ${imagenPath}:`, error);
                        } else {
                            console.log(`Imagen eliminada: ${imagenPath}`);
                        }
                    });
                } else {
                    console.warn(`No se encontró la imagen: ${imagenPath}`);
                }
            });
        }

        await Clientes.findByIdAndDelete(req.params.idCliente);

        res.json({ mensaje: 'Cliente eliminado correctamente' });

    } catch (error) {
        console.log('Error en eliminarCliente:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
        next(error);
    }
};


/* Eliminar imagen del cliente por separado */
exports.eliminarImagenCliente = async (req, res, next) => {
    try {
        const { idCliente } = req.params;
        const { nombreImagen } = req.body;

        const cliente = await Clientes.findById(idCliente);
        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        if (!cliente.imagen.includes(nombreImagen)) {
            return res.status(400).json({ mensaje: 'La imagen no pertenece al cliente' });
        }

        cliente.imagen = cliente.imagen.filter(img => img !== nombreImagen);

        const imagenPath = path.join(__dirname, '../uploads', nombreImagen);
        fs.unlink(imagenPath, err => {
            if (err) console.error('Error eliminando imagen:', err);
        });

        await cliente.save();

        res.json({ mensaje: 'Imagen eliminada correctamente', imagen: cliente.imagen });

    } catch (error) {
        console.error(error);
        next();
    }
};
