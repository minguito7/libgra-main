const Genero = require('../models/generoModel');

const express = require('express');
let router = express.Router();

router.post('/add-genero', async (req, res) => {
    try {
        const { nombre } = req.body;
        console.log(nombre);
        // Verificar que el nombre está presente
        if (!nombre) {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }

        // Crear una nueva instancia del modelo
        const nuevaGenero = new Genero({nombre});

        // Guardar la nueva población en la base de datos
        await nuevaGenero.save();

        // Enviar una respuesta exitosa
        res.status(201).json({
            mensaje: 'Genero creada exitosamente',
            poblacion: nuevaGenero
        });
    } catch (error) {
        console.error('Error al crear genero:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

router.get('/', async (req, res) => {
    try {
      const genero = await Genero.find().exec(); // Ejecutar la consulta         
      if (genero.length > 0) {
          res.send({ ok: true, resultado: genero});
      } else {
          res.status(404).send({ ok: false, error: "No se encontraron generos" });
      }
  } catch (err) {
      res.status(500).send({
          ok: false,
          error: err.message
      });
  }
});

module.exports = router;