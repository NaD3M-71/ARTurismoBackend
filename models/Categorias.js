const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GRUPOS = ['Gastronomía', 'Alojamiento', 'Transportes', 'Vida Nocturna', 'Atractivos', 'Servicios', 'Otros'];

const categoriasSchema = new Schema({
    nombre: {
        type: String,
        trim: true,
        required: [true, 'El nombre de la categoría es obligatorio'],
        unique: true,
    },
    grupo: {
        type: String,
        enum: {
            values: GRUPOS,
            message: 'El grupo seleccionado no es válido',
        },
        required: [true, 'El grupo es obligatorio'],
    },
    activa: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('Categorias', categoriasSchema);
module.exports.GRUPOS = GRUPOS;
