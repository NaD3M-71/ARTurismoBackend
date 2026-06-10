const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const consultasSchema = new Schema({
    nombre: {
        type: String,
        trim: true,
        required: [true, 'El nombre es obligatorio']
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, 'El email es obligatorio']
    },
    telefono: {
        type: String,
        trim: true
    },
    rubro: {
        type: String,
        trim: true
    },
    mensaje: {
        type: String,
        trim: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'contactado'],
        default: 'pendiente'
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Consultas', consultasSchema);
