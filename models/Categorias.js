const mongoose = require('mongoose');
const Schema= mongoose.Schema;

const categoriasPrincipales = [
    'Gastronomia',
    'Hospedaje',
    'Entretenimiento',
    'Mercados'
]

const categoriasSchema = new Schema({
    principal:{
        type: String,
        enum: {
            values: categoriasPrincipales,
            message: 'La categoria principal seleccionada no es válida',
          },
        required: [true, 'La categoria principal es obligatoria'],
    },
    subcategoria:{
        type: String,
        unique,
        
    }
});

module.exports = mongoose.model('Categorias', categoriasSchema );
