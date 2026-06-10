const Configuracion = require('../models/Configuracion.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const CLAVE_BANNER = 'banner_index';

const CLAVES_TEXTOS = {
    titulo_banner: 'texto_banner_principal',
    aboutus_titulo: 'texto_aboutus_titulo',
    aboutus_cuerpo: 'texto_aboutus_cuerpo'
};

const DEFAULTS_TEXTOS = {
    titulo_banner: 'Recorré Argentina de la mejor manera!',
    aboutus_titulo: 'TU AVENTURA EMPIEZA AQUÍ',
    aboutus_cuerpo: 'Somos el gran puente entre los viajeros y los mejores servicios turísticos de la zona. Nos dedicamos a mostrar todo lo que se puede vivir, conocer y disfrutar, conectando directamente con prestadores locales de confianza. Busca tu destino, ingresa a nuestras redes sociales. Tenemos las mejores opciones, viví una experiencia única con AR Turismo.'
};

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

exports.obtenerTextosInicio = async (req, res) => {
    try {
        const configs = await Configuracion.find({ clave: { $in: Object.values(CLAVES_TEXTOS) } });
        const textos = { ...DEFAULTS_TEXTOS };
        configs.forEach(c => {
            const key = Object.keys(CLAVES_TEXTOS).find(k => CLAVES_TEXTOS[k] === c.clave);
            if (key) textos[key] = c.valor;
        });
        res.json(textos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los textos' });
    }
};

exports.actualizarTextosInicio = async (req, res) => {
    try {
        const { titulo_banner, aboutus_titulo, aboutus_cuerpo } = req.body;
        const updates = [
            { clave: CLAVES_TEXTOS.titulo_banner, valor: titulo_banner },
            { clave: CLAVES_TEXTOS.aboutus_titulo, valor: aboutus_titulo },
            { clave: CLAVES_TEXTOS.aboutus_cuerpo, valor: aboutus_cuerpo }
        ];
        await Promise.all(updates.map(u =>
            Configuracion.findOneAndUpdate({ clave: u.clave }, { valor: u.valor }, { upsert: true, new: true })
        ));
        res.json({ mensaje: 'Textos actualizados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar los textos' });
    }
};
