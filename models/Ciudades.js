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
    // Contiene HTML generado por el editor Trix (permite saltos de línea y
    // negrita), por eso el límite es más alto que los 1000 caracteres
    // "visibles" que se pedían antes.
    type:String,
    required:[true, "Agregue una descripcion"],
    trim:true,
    maxLength: 4000
  },
  descripcioncorta:{
    type:String,
    required:[true, "Agregue una descripcion"],
    trim:true,
    maxLength: 100
  },
  // Versiones en inglés (opcionales). Si no están cargadas, el front usa la versión en español.
  descripcionEn:{
    type:String,
    trim:true,
    maxLength: 4000
  },
  descripcioncortaEn:{
    type:String,
    trim:true,
    maxLength: 100
  },
  imagen:{
    type: String
  }
});

// Creación del modelo

module.exports = mongoose.model('Ciudad', CiudadSchema);

