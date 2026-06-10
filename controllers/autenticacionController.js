const jwt = require('jsonwebtoken');
const Usuarios = require('../models/Usuarios');

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'Email y contraseña son requeridos'
            });
        }

        const usuario = await Usuarios.findOne({ email });

        if (!usuario) {
            return res.status(401).json({
                mensaje: 'Email o contraseña incorrectos'
            });
        }

        if (usuario.rol !== 'admin' && usuario.rol !== 'superadmin') {
            return res.status(403).json({
                mensaje: 'Solo administradores pueden acceder'
            });
        }

        const passwordValido = await usuario.compararPassword(password);

        if (!passwordValido) {
            return res.status(401).json({
                mensaje: 'Email o contraseña incorrectos'
            });
        }

        const token = jwt.sign(
            {
                userId: usuario._id,
                email: usuario.email,
                rol: usuario.rol
            },
            process.env.SECRETKEY,
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: 'Autenticación exitosa',
            data: {
                token,
                usuario: {
                    _id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                }
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: 'Error en el servidor'
        });
    }
};

exports.register = async (req, res, next) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (req.user.rol !== 'superadmin') {
            return res.status(403).json({
                mensaje: 'Solo los Super Administradores pueden crear usuarios'
            });
        }

        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({
                mensaje: 'Todos los campos son requeridos'
            });
        }

        const usuarioExistente = await Usuarios.findOne({ email });

        if (usuarioExistente) {
            return res.status(400).json({
                mensaje: 'El email ya está registrado'
            });
        }

        const nuevoUsuario = new Usuarios({
            nombre,
            email,
            password,
            rol
        });

        await nuevoUsuario.save();

        res.json({
            mensaje: 'Usuario registrado correctamente',
            data: {
                usuario: {
                    _id: nuevoUsuario._id,
                    nombre: nuevoUsuario.nombre,
                    email: nuevoUsuario.email,
                    rol: nuevoUsuario.rol
                }
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: 'Error en el servidor'
        });
    }
};

exports.obtenerUsuarios = async (req, res, next) => {
    try {
        if (req.user.rol !== 'superadmin') {
            return res.status(403).json({
                mensaje: 'Solo los Super Administradores pueden ver la lista de usuarios'
            });
        }

        const usuarios = await Usuarios.find({}, { password: 0 });
        res.json({
            mensaje: 'Usuarios obtenidos correctamente',
            data: usuarios
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: 'Error en el servidor'
        });
    }
};

exports.eliminarUsuario = async (req, res, next) => {
    try {
        const { usuarioId } = req.params;

        if (req.user.rol !== 'superadmin') {
            return res.status(403).json({
                mensaje: 'Solo los Super Administradores pueden eliminar usuarios'
            });
        }

        const usuario = await Usuarios.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        await Usuarios.findByIdAndDelete(usuarioId);

        res.json({
            mensaje: 'Usuario eliminado correctamente',
            data: {
                usuarioEliminado: usuario.email
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: 'Error en el servidor'
        });
    }
};

