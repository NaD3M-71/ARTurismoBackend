const express = require('express');
const router = express.Router();

const ciudadesController = require("../controllers/ciudadesController");
const clientesController = require("../controllers/clientesController");
const autenticacionController = require("../controllers/autenticacionController");
const busquedaController = require("../controllers/busquedaController");
const categoriasController = require("../controllers/categoriasController");
const configuracionController = require("../controllers/configuracionController");
const consultasController = require("../controllers/consultasController");
const auth = require("../middleware/auth");

module.exports = function(){
    router.get('/', (req,res)=>{
        res.send("Servidor iniciado correctamente");
    })

    // Búsqueda unificada
    router.get('/busqueda', busquedaController.buscar);

    /**AUTENTICACION */
    router.post('/login', autenticacionController.login);
    router.post('/register', auth, autenticacionController.register);
    router.get('/usuarios', auth, autenticacionController.obtenerUsuarios);
    router.delete('/usuarios/:usuarioId', auth, autenticacionController.eliminarUsuario);

  /**CIUDADES */
    // Agrega nuevas ciudades
    router.post("/ciudades",
      auth,
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
      auth,
      ciudadesController.subirArchivo,
      ciudadesController.actualizarCiudad
    );

    //Elimina ciudades
    router.delete("/ciudades/:idCiudad",
      auth,
      ciudadesController.eliminarCiudad
    )


  /**CLIENTES */
    //agregar nuevo cliente
    router.post("/clientes",
      auth,
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
      auth,
      clientesController.subirArchivo,
      clientesController.actualizarCliente
    )

    //Eliminar Cliente
    router.delete('/clientes/:idCliente',
      auth,
      clientesController.eliminarCliente);
    // Eliminar imagen del cliente
    router.delete('/clientes/:idCliente/imagen',
      auth,
      clientesController.eliminarImagenCliente);

  /**CONFIGURACION */
    router.get('/configuracion/banner', configuracionController.obtenerBanner);
    router.put('/configuracion/banner', auth, configuracionController.subirArchivo, configuracionController.actualizarBanner);

  /**CONSULTAS */
    // Crear consulta (público - desde el formulario)
    router.post('/consultas', consultasController.crearConsulta);
    // Obtener todas las consultas (solo admin)
    router.get('/consultas', auth, consultasController.obtenerConsultas);
    // Actualizar estado de consulta (solo admin)
    router.put('/consultas/:id', auth, consultasController.actualizarEstado);
    // Eliminar consulta (solo admin)
    router.delete('/consultas/:id', auth, consultasController.eliminarConsulta);
    // Enviar email al potencial cliente (solo admin)
    router.post('/consultas/email', auth, consultasController.enviarEmail);

  /**CATEGORIAS */
    // Listar categorías (público)
    router.get('/categorias', categoriasController.listarCategorias);
    // Listar grupos (público)
    router.get('/categorias/grupos', categoriasController.listarGrupos);
    // Crear categoría (protegido)
    router.post('/categorias', auth, categoriasController.crearCategoria);
    // Eliminar categoría (protegido)
    router.delete('/categorias/:id', auth, categoriasController.eliminarCategoria);

    return router;
}