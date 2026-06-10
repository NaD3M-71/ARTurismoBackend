const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

const Usuarios = require('../models/Usuarios');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log('MongoDB conectado...');

    // Elimina cualquier usuario admin existente con el mismo email para evitar duplicados
    const resultado = await Usuarios.deleteOne({ email: 'admin@test.com' });
    if (resultado.deletedCount > 0) {
      console.log('Usuario anterior eliminado');
    }

    // Crea un nuevo admin con credenciales predefinidas
    const nuevoAdmin = new Usuarios({
      nombre: 'Admin Test',
      email: 'admin@test.com',
      password: 'SecurePassword123',
      rol: 'admin'
    });

    await nuevoAdmin.save();
    console.log('\nAdmin creado exitosamente!');
    console.log('Email: admin@test.com');
    console.log('Password: SecurePassword123');
    console.log('Rol: admin');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error al crear el usuario admin:', error);
    process.exit(1);
  }
}

seedAdmin();
