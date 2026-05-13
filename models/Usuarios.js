const mongoose = require('mongoose');
const Schema= mongoose.Schema;

const roles = [
    "usuario",
    "admin",
    "superadmin"
]

const usuariosSchema = new Schema({
    nombre:{
        type: String,
        trim: true,
        required: [true, "El Nombre es Obligatorio"]
    },
    email:{
        type:String,
        lowercase: true,
        trim: true,
        required: [true, "El email del proovedor es obligatorio"]
    },
    password:{
        type: String,
        required: [true, "La contraseña es obligatoria"]
    },
    rol:{
        type: String,
        enum: {
            values: roles,
            message: 'El rol seleccionado no es válido',
        },
        required: [true, 'El rol es obligatorio']
    }
});

module.exports = mongoose.model('Usuarios', usuariosSchema );

// 23 32 65 4