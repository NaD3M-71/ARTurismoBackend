const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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

usuariosSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

usuariosSchema.methods.compararPassword = async function(passwordIngresada) {
    return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuarios', usuariosSchema );