const mongoose = require('mongoose');
const Schema= mongoose.Schema;

const tier = [
    "I",
    "II",
    "III"
]

const clientesSchema = new Schema({
    nombre:{
        type: String,
        trim: true,
        required: [true, "El Nombre es Obligatorio"]
    },
    ciudad:{
        type: String,
        required: [true, "La ciudad es obligatoria"]
    },
    ciudad_id: { type: Schema.Types.ObjectId, ref: "Ciudad" }, // Relación con la ciudad
    direccion:{
        type:String,
        trim: true
    },
    categoria:[{
        type: String,
        required: [true, "La categoria es obligatoria"]
    }],
    email:{
        type:String,
        lowercase: true,
        trim: true,
        required: [true, "El email del proovedor es obligatorio"]
    },
    telefono:{
        type: String,
        trim:true
    },
    whatsapp:{
        type: String,
        trim:true
    },
    instagram:{
        type: String,
        trim:true
    },
    facebook:{
        type: String,
        trim: true
    },
    url:{
        type: String,
        trim: true
    },
    descripcion:{
        type: String,
        required: [true, "La descripcion es obligatoria"]
    },
    informacion:{
        type: String,
        required: [true, "La descripcion es obligatoria"]
    },
    lat:{
        type: String,
        required: [true,"La latitud es obligatoria"]
    },
    lng:{
        type: String,
        required: [true,"La longitud es obligatoria"]
    },
    tier:{
        type: String,
        required: [true, "El metodo de suscripcion es obligatorio"]
    },
    imagen:{
        type: [String]
    }
});

module.exports = mongoose.model('Clientes', clientesSchema );

// 23 32 65 4