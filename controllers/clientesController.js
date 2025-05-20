const Clientes = require('../models/Clientes.js');
const { unlink } =require('fs');
const multer = require('multer');
const fs = require('fs');
const {nanoid} = require('nanoid');
const path = require('path');


// config de multer
const configuracionMulter = {
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../uploads/');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${nanoid()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'|| file.mimetype === 'image/gif') {
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'))
        }
    }
}

// Pasar la configuración y el campo
const upload = multer(configuracionMulter).array('imagen',5);

// Subir archivo
exports.subirArchivo = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            res.json({ mensaje: error })
        }
        return next();
    })
}


// agrega una nueva ciudad
exports.agregarCliente = async (req, res, next) => {
    const cliente = new Clientes(req.body);

    try {
        // Si se suben archivos, asignamos las rutas relativas
        if (req.files && req.files.length > 0) {
            cliente.imagen = req.files.map(file => `${path.basename(file.path)}`);
            
        }

        // Guardar el cliente en la base de datos
        await cliente.save();
        res.json({ mensaje: 'Cliente agregado correctamente' });

    } catch (error) {
        console.log(error);
        next();
    }
}

exports.mostrarClientes = async(req,res) =>{
    try {
        const clientes = await Clientes.find({});
        res.json(clientes)
        
    } catch (error) {
        console.log(error);
        //next();
    }
}

exports.mostrarCliente = async (req,res,next) =>{
    const cliente = await Clientes.findById(req.params.idCliente);

    if(!cliente){
        res.json({mensaje:'No se encuentra esta cliente'});
        return next();
    };
    // mostrar producto
    res.json(cliente);
        
}

exports.buscarCliente = async (req,res,next)=>{
    try {
        // obtener el query
        const { query } = req.params;
        const cliente = await Clientes.find({ nombre: new RegExp(query, 'i')});
        res.json(cliente);
    } catch (error) {
        console.log(error);
        next();
    }
}


exports.actualizarCliente = async (req, res, next) => {
    try {
        // Buscar el cliente en la base de datos
        let clienteAnterior = await Clientes.findById(req.params.idCliente);
        if (!clienteAnterior) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        // Construir el nuevo objeto del cliente
        let nuevoCliente = req.body;

        // Si hay imágenes nuevas
        if (req.files && req.files.length > 0) {
            // Guardar las nuevas imágenes
            nuevoCliente.imagen = req.files.map(file => file.path);

            // Eliminar imágenes antiguas del servidor
            if (clienteAnterior.imagen && clienteAnterior.imagen.length > 0) {
                clienteAnterior.imagen.forEach(imagen => {
                    const imagenAnteriorPath = path.join(__dirname, '..', imagen);
                    unlink(imagenAnteriorPath, (error) => {
                        if (error) console.log(`Error al eliminar ${imagenAnteriorPath}:`, error);
                    });
                });
            }
        } else {
            // Mantener las imágenes antiguas
            nuevoCliente.imagen = clienteAnterior.imagen;
        }

        // Actualizar cliente en la base de datos
        let cliente = await Clientes.findByIdAndUpdate(req.params.idCliente, nuevoCliente, {
            new: true, // Devuelve el cliente actualizado
        });

        res.json({ mensaje: 'Se ha actualizado la información del cliente', cliente });

    } catch (error) {
        console.error(error);
        next();
    }
};


exports.eliminarCliente = async (req, res, next) => {
    try {
        // Buscar el cliente antes de eliminarlo
        const cliente = await Clientes.findById(req.params.idCliente);
        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        // Eliminar imágenes del servidor si existen
        if (cliente.imagen) {
            // Si la imagen es un array, lo recorremos, si es string, lo convertimos en array
            const imagenes = Array.isArray(cliente.imagen) ? cliente.imagen : [cliente.imagen];

            imagenes.forEach(imagen => {
                let imagenPath = imagen;

                // Si la ruta de la imagen NO es absoluta, la construimos con path.join
                if (!path.isAbsolute(imagen)) {
                    imagenPath = path.join(__dirname, '..', 'uploads', imagen);
                }

                // Verificamos si la imagen realmente existe antes de eliminarla
                if (fs.existsSync(imagenPath)) {
                    fs.unlink(imagenPath, (error) => {
                        if (error) {
                            console.error(`Error al eliminar ${imagenPath}:`, error);
                        } else {
                            console.log(`Imagen eliminada: ${imagenPath}`);
                        }
                    });
                } else {
                    console.warn(`No se encontró la imagen: ${imagenPath}`);
                }
            });
        }

        // Eliminar cliente de la base de datos
        await Clientes.findByIdAndDelete(req.params.idCliente);

        res.json({ mensaje: 'Cliente eliminado correctamente' });

    } catch (error) {
        console.log('Error en eliminarCliente:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
        next(error);
    }
};