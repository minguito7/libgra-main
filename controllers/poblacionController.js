const PoblacionModel = require('../models/poblacionModel');

// Controlador para añadir una nueva población
exports.addPoblacion = async (req, res) => {
    try {
        const { nombre } = req.body;

        // Crear una nueva instancia de población
        const nuevaPoblacion = new PoblacionModel({ nombre });

        // Guardar la nueva población en la base de datos
        await nuevaPoblacion.save();

        res.status(201).json({ mensaje: 'Población creada correctamente' });
    } catch (error) {
        console.error('Error al añadir población:', error);
        res.status(500).json({ mensaje: 'Error al añadir población' });
    }
};

// Controlador para borrar una población por ID
exports.deletePoblacionById = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar la población por ID y borrarla
        await PoblacionModel.findByIdAndDelete(id);

        res.status(200).json({ mensaje: 'Población eliminada correctamente' });
    } catch (error) {
        console.error('Error al borrar población:', error);
        res.status(500).json({ mensaje: 'Error al borrar población' });
    }
};

// Controlador para editar una población por ID
exports.editPoblacionById = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        // Buscar la población por ID y actualizarla
        await PoblacionModel.findByIdAndUpdate(id, { nombre });

        res.status(200).json({ mensaje: 'Población actualizada correctamente' });
    } catch (error) {
        console.error('Error al editar población:', error);
        res.status(500).json({ mensaje: 'Error al editar población' });
    }
};

// Controlador para ver una población por ID
exports.getPoblacionById = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar la población por ID
        const poblacion = await PoblacionModel.findById(id);

        res.status(200).json(poblacion);
    } catch (error) {
        console.error('Error al obtener población por ID:', error);
        res.status(500).json({ mensaje: 'Error al obtener población por ID' });
    }
};

// Controlador para ver todas las poblaciones
exports.getAllPoblaciones = async (req, res) => {
    try {
        // Obtener todas las poblaciones
        const poblaciones = await PoblacionModel.find();

        res.status(200).json(poblaciones);
    } catch (error) {
        console.error('Error al obtener todas las poblaciones:', error);
        res.status(500).json({ mensaje: 'Error al obtener todas las poblaciones' });
    }
};
