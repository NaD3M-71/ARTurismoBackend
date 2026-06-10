const Configuracion = require('../models/Configuracion.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const CLAVE_BANNER = 'banner_index';

function getExt(mimetype) {
    const ext = mimetype.split('/')[1];
    return ext === 'jpeg' ? 'jpg' : ext;
}

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

const upload = multer(configuracionMulter).single('banner');

exports.subirArchivo = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) return res.status(400).json({ mensaje: error.message });
        return next();
    });
};

exports.obtenerBanner = async (req, res) => {
    try {
        const config = await Configuracion.findOne({ clave: CLAVE_BANNER });
        res.json({ banner: config ? config.valor : null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener el banner' });
    }
};

exports.actualizarBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ mensaje: 'No se subió ninguna imagen' });
        }

        const ext = getExt(req.file.mimetype);
        const nuevoNombre = `Banner-Index.${ext}`;
        const carpeta = path.join(__dirname, '..', 'uploads');

        // Borrar el banner anterior si existe
        const configAnterior = await Configuracion.findOne({ clave: CLAVE_BANNER });
        if (configAnterior && configAnterior.valor) {
            const oldPath = path.join(carpeta, configAnterior.valor);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Renombrar el archivo temporal al nombre definitivo
        fs.renameSync(path.join(carpeta, req.file.filename), path.join(carpeta, nuevoNombre));

        // Guardar en base de datos
        await Configuracion.findOneAndUpdate(
            { clave: CLAVE_BANNER },
            { valor: nuevoNombre },
            { upsert: true, new: true }
        );

        res.json({ mensaje: 'Banner actualizado correctamente', banner: nuevoNombre });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el banner' });
    }
};
