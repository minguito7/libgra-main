const CategoriaModel = require('../models/categoriaModel.js');

// Controlador para añadir una nueva categoría
exports.addCategoria = async (req, res) => {
    try {
        const { nombre } = req.body;

        // Crear una nueva instancia de categoría
        const nuevaCategoria = new CategoriaModel({ nombre });

        // Guardar la nueva categoría en la base de datos
        await nuevaCategoria.save();

        res.status(201).json({ mensaje: 'Categoría creada correctamente' });
    } catch (error) {
        console.error('Error al añadir categoría:', error);
        res.status(500).json({ mensaje: 'Error al añadir categoría' });
    }
};

// Controlador para borrar una categoría por ID
exports.deleteCategoriaById = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar la categoría por ID y borrarla
        await CategoriaModel.findByIdAndDelete(id);

        res.status(200).json({ mensaje: 'Categoría eliminada correctamente' });
    } catch (error) {
        console.error('Error al borrar categoría:', error);
        res.status(500).json({ mensaje: 'Error al borrar categoría' });
    }
};

// Controlador para editar una categoría por ID
exports.editCategoriaById = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        // Buscar la categoría por ID y actualizarla
        await CategoriaModel.findByIdAndUpdate(id, { nombre });

        res.status(200).json({ mensaje: 'Categoría actualizada correctamente' });
    } catch (error) {
        console.error('Error al editar categoría:', error);
        res.status(500).json({ mensaje: 'Error al editar categoría' });
    }
};

// Controlador para ver una categoría por ID
exports.getCategoriaById = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar la categoría por ID
        const categoria = await CategoriaModel.findById(id);

        res.status(200).json(categoria);
    } catch (error) {
        console.error('Error al obtener categoría por ID:', error);
        res.status(500).json({ mensaje: 'Error al obtener categoría por ID' });
    }
};

// Controlador para ver todas las categorías
exports.getAllCategorias = async (req, res) => {
    try {
        // Obtener todas las categorías
        const categorias = await CategoriaModel.find();

        res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al obtener todas las categorías:', error);
        res.status(500).json({ mensaje: 'Error al obtener todas las categorías' });
    }
};