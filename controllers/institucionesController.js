const Instituciones = require('../models/Instituciones.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

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

// config de multer (mismo mecanismo que clientes/banner: se guarda con nombre temporal y luego se renombra)
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
            cb(new Error('Formato no válido. Solo se aceptan JPG, PNG y GIF.'));
        }
    }
};

const upload = multer(configuracionMulter).single('logo');

exports.subirArchivo = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) return res.status(400).json({ mensaje: error.message });
        return next();
    });
};

exports.listarInstituciones = async (req, res) => {
    try {
        const instituciones = await Instituciones.find().sort({ createdAt: 1 });
        res.json(instituciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener las instituciones' });
    }
};

exports.agregarInstitucion = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ mensaje: 'El nombre de la institución es obligatorio' });
        }
        if (!req.file) {
            return res.status(400).json({ mensaje: 'El logo es obligatorio' });
        }

        const carpeta = path.join(__dirname, '..', 'uploads');
        const nombreSanitizado = sanitizarNombre(nombre) || nanoid(8);
        const nuevoNombre = `${nombreSanitizado}.${getExt(req.file.mimetype)}`;
        fs.renameSync(path.join(carpeta, req.file.filename), path.join(carpeta, nuevoNombre));

        const institucion = new Instituciones({ nombre: nombre.trim(), logo: nuevoNombre });
        await institucion.save();

        res.json({ mensaje: 'Institución agregada correctamente', institucion });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ mensaje: 'Ya existe una institución con ese nombre' });
        }
        res.status(500).json({ mensaje: 'Error al agregar la institución' });
    }
};

exports.eliminarInstitucion = async (req, res) => {
    try {
        const institucion = await Instituciones.findById(req.params.id);
        if (!institucion) {
            return res.status(404).json({ mensaje: 'Institución no encontrada' });
        }

        const logoPath = path.join(__dirname, '..', 'uploads', institucion.logo);
        if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
        }

        await Instituciones.findByIdAndDelete(req.params.id);

        res.json({ mensaje: 'Institución eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar la institución' });
    }
};
