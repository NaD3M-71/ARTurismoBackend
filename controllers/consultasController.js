const Consultas = require('../models/Consultas');
const nodemailer = require('nodemailer');

function crearTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

exports.crearConsulta = async (req, res) => {
    try {
        const consulta = new Consultas(req.body);
        await consulta.save();
        res.json({ mensaje: 'Consulta enviada correctamente. Nos contactaremos a la brevedad.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al enviar la consulta', error: error.message });
    }
};

exports.obtenerConsultas = async (req, res) => {
    try {
        const consultas = await Consultas.find({}).sort({ fecha: -1 });
        res.json(consultas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener las consultas' });
    }
};

exports.actualizarEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        const consulta = await Consultas.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        );
        if (!consulta) return res.status(404).json({ mensaje: 'Consulta no encontrada' });
        res.json({ mensaje: 'Estado actualizado', consulta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el estado' });
    }
};

exports.eliminarConsulta = async (req, res) => {
    try {
        const consulta = await Consultas.findByIdAndDelete(req.params.id);
        if (!consulta) return res.status(404).json({ mensaje: 'Consulta no encontrada' });
        res.json({ mensaje: 'Consulta eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar la consulta' });
    }
};

exports.enviarEmail = async (req, res) => {
    try {
        const { destinatario, asunto, cuerpo } = req.body;

        if (!destinatario || !asunto || !cuerpo) {
            return res.status(400).json({ mensaje: 'Faltan campos requeridos: destinatario, asunto, cuerpo' });
        }

        const transporter = crearTransporter();

        await transporter.sendMail({
            from: `"ArTurismo" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: asunto,
            text: cuerpo,
            html: `<p style="white-space: pre-line;">${cuerpo.replace(/\n/g, '<br/>')}</p>`
        });

        // Marcar la consulta como contactado si se pasa el id
        if (req.body.consultaId) {
            await Consultas.findByIdAndUpdate(req.body.consultaId, { estado: 'contactado' });
        }

        res.json({ mensaje: 'Email enviado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al enviar el email', error: error.message });
    }
};
