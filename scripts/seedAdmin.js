const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

const Usuarios = require('../models/Usuarios');

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const nombre = process.env.SEED_ADMIN_NOMBRE || 'Super Administrador';

  if (!email || !password) {
    console.error('Faltan SEED_ADMIN_EMAIL o SEED_ADMIN_PASSWORD');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log('MongoDB conectado...');

    // Si ya existe un usuario con ese email, no se toca
    const existente = await Usuarios.findOne({ email: email.toLowerCase().trim() });
    if (existente) {
      console.error('Ya existe un usuario con ese email. No se realizaron cambios.');
      await mongoose.disconnect();
      process.exit(1);
    }

    const nuevoAdmin = new Usuarios({
      nombre,
      email,
      password,
      rol: 'superadmin'
    });

    await nuevoAdmin.save();
    console.log('Superadmin creado exitosamente');
    console.log('Email: ' + nuevoAdmin.email);
    console.log('Rol: ' + nuevoAdmin.rol);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error al crear el usuario superadmin:', error);
    process.exit(1);
  }
}

seedAdmin();