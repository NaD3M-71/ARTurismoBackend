const Categorias = require('../models/Categorias');
const { GRUPOS } = require('../models/Categorias');

// Listar todas las categorías activas
exports.listarCategorias = async (req, res) => {
    try {
        const categorias = await Categorias.find({ activa: true }).sort({ grupo: 1, nombre: 1 });
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener categorías' });
    }
};

// Listar grupos disponibles
exports.listarGrupos = (req, res) => {
    res.json(GRUPOS);
};

// Crear categoría
exports.crearCategoria = async (req, res) => {
    const { nombre, grupo } = req.body;

    try {
        const nueva = new Categorias({ nombre, grupo });
        await nueva.save();
        res.status(201).json(nueva);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ mensaje: 'Ya existe una categoría con ese nombre' });
        }
        res.status(400).json({ mensaje: error.message });
    }
};

// Eliminar categoría
exports.eliminarCategoria = async (req, res) => {
    const { id } = req.params;

    try {
        await Categorias.findByIdAndDelete(id);
        res.json({ mensaje: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar categoría' });
    }
};
