const mongoose = require('mongoose');

// Opciones predeterminadas para provincia y país
const provincias = [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];

  const paises = [
    'Argentina',
    'Bolivia',
    'Brasil',
    'Chile',
    'Colombia',
    'Ecuador',
    'Paraguay',
    'Perú',
    'Uruguay',
    'Venezuela'
  ];

// Definición del esquema
const CiudadSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la ciudad es obligatorio'],
    trim: true,
  },
  provincia: {
    type: String,
    required: [true, 'La provincia es obligatoria'],
  },
  pais: {
    type: String,
    required: [true, 'El país es obligatorio'],
  },
  descripcion:{
    type:String,
    required:[true, "Agregue una descripcion"],
    trim:true,
    maxLength: 1000
  },
  descripcioncorta:{
    type:String,
    required:[true, "Agregue una descripcion"],
    trim:true,
    maxLength: 100
  },
  imagen:{
    type: String
  }
});

// Creación del modelo

module.exports = mongoose.model('Ciudad', CiudadSchema);

