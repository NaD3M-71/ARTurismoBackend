const Ciudades = require('../models/Ciudades.js');
const { unlink } =require('fs');
const multer = require('multer');
const fs = require('fs');
const {nanoid} = require('nanoid');

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
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'))
        }
    }
}

// Pasar la configuración y el campo
const upload = multer(configuracionMulter).single('imagen');

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
exports.agregarCiudad = async (req,res,next) =>{
    const ciudad = new Ciudades(req.body);

    try {
        if(req.file.filename){
            ciudad.imagen = req.file.filename
        }
        await ciudad.save();
        res.json({mensaje: 'Ciudad agregada correctamente'})
    } catch (error){
        console.log(error);
        next();
    }
}

exports.mostrarCiudades = async(req,res) =>{
    try {
        const ciudades = await Ciudades.find({});
        res.json(ciudades)
        
    } catch (error) {
        console.log(error);
        next();
    }
}

exports.mostrarCiudad = async (req,res,next) =>{
    const ciudad = await Ciudades.findById(req.params.ciudadId);

    if(!ciudad){
        res.json({mensaje:'No se encuentra esta ciudad'});
        return next();
    };
    // mostrar producto
    res.json(ciudad);
        
}

exports.buscarCiudad = async (req,res,next)=>{
    try {
        // obtener el query
        const { query } = req.params;
        const ciudad = await Ciudades.find({ nombre: new RegExp(query, 'i')});
        res.json(ciudad);
    } catch (error) {
        console.log(error);
        next();
    }
}


exports.actualizarCiudad = async (req,res,next) =>{
    try {
        // seleccionar producto
        let ciudadAnterior = await Ciudades.findById(req.params.idCiudad);

        //construir nuevo producto
        let nuevaCiudad = req.body;

        //verificar si hay imagen nueva
        if(req.file){
            nuevaCiudad.imagen = req.file.filename;
            const imagenAnteriorPath = __dirname+`/../uploads/${ciudadAnterior.imagen}`
            unlink(imagenAnteriorPath, (error) => {
                if (error) {
                return console.log(error)
                }
            })
        } else {
            nuevaCiudad.imagen = ciudadAnterior.imagen;
        }

        let ciudad = await Ciudades.findOneAndUpdate({_id: req.params.idCiudad}, nuevaCiudad,{
            new: true,
        });
        
        // mostrar producto
        await res.json({mensaje:'Se ha actualizado la informacion de esta ciudad',ciudad})
            
    } catch (error) {
        console.log(error);
        next();
    }

}


// Eliminar Ciudad
exports.eliminarCiudad = async (req,res,next) =>{
    try {
        await Ciudades.findOneAndDelete({ _id: req.params.idCiudad});
        
        res.json({mensaje: 'Ciudad Eliminada'})
    } catch (error) {
        console.log(error);
    }


    // mostrar mensaje
        
}