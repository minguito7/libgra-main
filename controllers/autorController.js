const express = require('express');
const router = express.Router();
const Autor = require('../models/autorModel');

// POST - Añadir un nuevo autor
router.post('/add-autor', async (req, res) => {
    try {
        const { nombre, apellidos, fecha_nacimiento, nacionalidad, generos_autor } = req.body;

        // Verificar que los campos requeridos están presentes
        if (!nombre || !apellidos) {
            return res.status(400).json({ mensaje: 'El nombre y los apellidos son obligatorios' });
        }

        // Crear una nueva instancia del modelo Autor
        const nuevoAutor = new Autor({
            nombre,
            apellidos,
            fecha_nacimiento,
            nacionalidad,
            generos_autor
        });

        // Guardar el nuevo autor en la base de datos
        await nuevoAutor.save();

        // Enviar una respuesta exitosa
        res.status(201).json({
            mensaje: 'Autor creado exitosamente',
            autor: nuevoAutor
        });
    } catch (error) {
        console.error('Error al crear el autor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});



// GET - Obtener todos los autores
router.get('/', async (req, res) => {
    try {
        const autores = await Autor.find().populate('libros_autor').populate('generos_autor').exec(); // Ejecutar la consulta
        
        if (autores.length > 0) {
            res.send({ ok: true, resultado: autores });
        } else {
            res.statuslibros_autor(404).send({ ok: false, error: "No se encontraron autores" });
        }
    } catch (err) {
        res.status(500).send({
            ok: false,
            error: err.message
        });
    }
});

module.exports = router;
