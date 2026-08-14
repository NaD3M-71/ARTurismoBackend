const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const institucionesSchema = new Schema({
    nombre: {
        type: String,
        trim: true,
        required: [true, 'El nombre de la institución es obligatorio'],
        unique: true
    },
    logo: {
        type: String,
        required: [true, 'El logo es obligatorio']
    }
}, { timestamps: true });

module.exports = mongoose.model('Instituciones', institucionesSchema);
