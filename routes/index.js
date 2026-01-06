const express = require('express');
const router = express.Router();


const ciudadesController = require("../controllers/ciudadesController");
const clientesController = require("../controllers/clientesController");

module.exports = function(){
    router.get('/', (req,res)=>{
        res.send("Servidor iniciado correctamente");
    })


  /**CIUDADES */
    // Agrega nuevas ciudades
    router.post("/ciudades", 
      ciudadesController.subirArchivo,
      ciudadesController.agregarCiudad);

    // Mostrar ciudades
    router.get('/ciudades', ciudadesController.mostrarCiudades);

    // Buscar ciudad
    router.get('/ciudades/:ciudadId', ciudadesController.mostrarCiudad);

    // Busqueda de ciudades
    router.post(
      "/ciudades/busqueda/:query", ciudadesController.buscarCiudad);
    
    //modifica ciudades
    router.put(
      "/ciudades/:idCiudad",
      //auth,  TODO Agregar autorizaciones
      ciudadesController.subirArchivo,
      ciudadesController.actualizarCiudad
    );

    //Elimina ciudades
    router.delete("/ciudades/:idCiudad",
      ciudadesController.eliminarCiudad
    )


  /**CLIENTES */
    //agregar nuevo cliente
    router.post("/clientes",
      clientesController.subirArchivo,
      clientesController.agregarCliente
    )    
    //mostrar Clientes
    router.get('/clientes', clientesController.mostrarClientes)
    
    //mostrar cliente
    router.get('/clientes/:idCliente', clientesController.mostrarCliente)

    //mostrar clientes por ciudad
    router.get('/clientes/ciudad/:ciudadNombre', clientesController.mostrarClientesPorCiudad)
   
    //actualizar Cliente
    router.put('/clientes/:idCliente', 
      clientesController.subirArchivo,
      clientesController.actualizarCliente
    )

    //Eliminar Cliente
    router.delete('/clientes/:idCliente', clientesController.eliminarCliente);
    // Eliminar imagen del cliente
    router.delete('/clientes/:idCliente/imagen', clientesController.eliminarImagenCliente);

    return router;
}