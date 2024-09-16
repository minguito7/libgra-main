const Genero = require('../models/generoModel');
const validate = require('./validate-token');
const express = require('express');
let router = express.Router();


async function obtenerUltimoGenero() {
    try {
        // Consultar todos los usuarios ordenados por el ID de manera descendente

        const allGenero = await Genero.find();
        let ultimoGenero = 1;
        allGenero.forEach(g => {
            //console.log(usuario);
            if (g.numGenero > ultimoGenero) {
                ultimoGenero = g.numGenero
            }
        });

        // Si se encontró un usuario, devolver su ID + 1, de lo contrario devolver 1
        if (ultimoGenero > 0) {
            //console.log(ultimoUsuario);
            return ultimoGenero + 1;
        } else {
            return 1; // Establecer el ID en 1 si no hay usuarios
        }
    } catch (error) {
        console.error('Error al obtener el último NUM de genero:', error);
        throw error; // Puedes manejar el error según sea necesario en tu aplicación
    }
}

router.post('/add-genero', validate.protegerRuta(['editor','soid','admin']) ,async (req, res) => {
    try {
        const { nombre } = req.body;
        console.log(nombre);
        let detUltGen = await obtenerUltimoGenero();
        // Verificar que el nombre está presente
        if (!nombre) {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }

        // Crear una nueva instancia del modelo
        const nuevaGenero = new Genero({nombre,detUltGen});

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