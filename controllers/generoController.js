const GeneroModel = require('../models/generoModel.js');

// Controlador para añadir un nuevo género
exports.addGenero = async (req, res) => {
    try {
        const { nombre } = req.body;

        // Crear una nueva instancia de género
        const nuevoGenero = new GeneroModel({ nombre });

        // Guardar el nuevo género en la base de datos
        await nuevoGenero.save();

        res.status(201).json({ mensaje: 'Género creado correctamente' });
    } catch (error) {
        console.error('Error al añadir género:', error);
        res.status(500).json({ mensaje: 'Error al añadir género' });
    }
};

// Controlador para borrar un género por ID
exports.deleteGeneroById = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar el género por ID y borrarlo
        await GeneroModel.findByIdAndDelete(id);

        res.status(200).json({ mensaje: 'Género eliminado correctamente' });
    } catch (error) {
        console.error('Error al borrar género:', error);
        res.status(500).json({ mensaje: 'Error al borrar género' });
    }
};

// Controlador para editar un género por ID
exports.editGeneroById = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        // Buscar el género por ID y actualizarlo
        await GeneroModel.findByIdAndUpdate(id, { nombre });

        res.status(200).json({ mensaje: 'Género actualizado correctamente' });
    } catch (error) {
        console.error('Error al editar género:', error);
        res.status(500).json({ mensaje: 'Error al editar género' });
    }
};

// Controlador para ver un género por ID
exports.getGeneroById = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar el género por ID
        const genero = await GeneroModel.findById(id);

        res.status(200).json(genero);
    } catch (error) {
        console.error('Error al obtener género por ID:', error);
        res.status(500).json({ mensaje: 'Error al obtener género por ID' });
    }
};

// Controlador para ver todos los géneros
exports.getAllGeneros = async (req, res) => {
    try {
        // Obtener todos los géneros
        const generos = await GeneroModel.find();

        res.status(200).json(generos);
    } catch (error) {
        console.error('Error al obtener todos los géneros:', error);
        res.status(500).json({ mensaje: 'Error al obtener todos los géneros' });
    }
};
