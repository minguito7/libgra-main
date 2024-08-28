const Categoria = require('../models/categoriaModel');

const express = require('express');
let router = express.Router();

router.post('/add-categoria', async (req, res) => {
    try {
        const { nombre } = req.body;
        
        // Verificar que el nombre está presente
        if (!nombre) {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }

        // Crear una nueva instancia del modelo
        const nuevaCategoria = new Categoria({nombre});

        // Guardar la nueva población en la base de datos
        await nuevaCategoria.save();

        // Enviar una respuesta exitosa
        res.status(201).json({
            mensaje: 'Categoria creada exitosamente',
            poblacion: nuevaCategoria
        });
    } catch (error) {
        console.error('Error al crear categoria:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

router.get('/', async (req, res) => {
    try {
      const categoria = await Categoria.find().exec(); // Ejecutar la consulta         
      if (categoria.length > 0) {
          res.send({ ok: true, resultado: categoria});
      } else {
          res.status(404).send({ ok: false, error: "No se encontraron categorias" });
      }
  } catch (err) {
      res.status(500).send({
          ok: false,
          error: err.message
      });
  }
});

module.exports = router;