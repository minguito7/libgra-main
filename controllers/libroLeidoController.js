const express = require('express');
const router = express.Router();
const LibroLeidoModel = require('../models/librosLeidosModel.js');
const Usuario = require('../models/userModel.js');
const validate = require('./validate-token');

//DEVOLVER LIBROS LEIDOS
router.get('/', validate.protegerRuta(''),  async (req, res) => {
  try {

    // Busca todos los registros de libros leídos por el usuario
    const librosLeidos = await LibroLeidoModel.find()
    .populate({
      path: 'id_usuario',
      populate: [
        { path: 'ID_POBLACION' },  
        { path: 'AMIGOS' }
      ]
    })
    .populate({
      path: 'id_libro',
      populate: [
        { path: 'added_usuario' },  
        { path: 'categorias_libro' },
        { path: 'generos_libro' },
        { path: 'resenas_libro' },
      ]
    })
    .exec();
    
    if (!librosLeidos.length) {
      return res.status(404).json({ error: 'No se encontraron libros leídos' });
    }

    if (librosLeidos.length > 0) {
          res.status(200).send({ ok: true, resultado: librosLeidos});
    } else {
          res.status(404).send({ ok: false, error: "No se encontraron libros" });
    }

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los libros leídos' });
  }    
})


//DEVOLVER LIBRO LEIDO
router.get('/:id', validate.protegerRuta(''),  async (req, res) => {
  try {
    
    // Busca el registro del libro leído por el usuario
    const libroLeido = await LibroLeidoModel.findById({ _id: req.params.id }).populate({
      path: 'id_usuario',
      populate: [
        { path: 'ID_POBLACION' },  
        { path: 'AMIGOS' }
      ]
    })
    .populate({
      path: 'id_libro',
      populate: [
        { path: 'added_usuario' },  
        { path: 'categorias_libro' },
        { path: 'generos_libro' },
        { path: 'resenas_libro' },
      ]
    })
    .exec();

    if (!libroLeido) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
   
    res.send({ ok: true, resultado: libroLeido});  

  } catch (error) {
    res.status(id_libro500).json({ error: 'Error al obtener los datos de lectura' + error });
  }
})

//DEVOLVER LIBRO LEIDO TRUE SI EL NUMERO ES > QUE EL ULTIMO NUMERO DE PAGINAS GUARDADO
router.get('/:idUsuario/:idLibro', validate.protegerRuta(''),  async (req, res) => {
  try {
    const librosUsuarioSolicitado = [];

    // Busca el registro del libro leído por el usuario
    const libroLeido = await LibroLeidoModel.find({id_libro:req.params.idLibro});


    if (!libroLeido) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    libroLeido.forEach( resp =>{
      if(resp.id_usuario == req.params.idUsuario){
        librosUsuarioSolicitado.push(resp);
      }
    });
    // Ordenar por fechas (más reciente a más antigua)
    librosUsuarioSolicitado.sort((a, b) => new Date(b.fecha_lectura) - new Date(a.fecha_lectura));

    res.send({ ok: true, resultado: librosUsuarioSolicitado});  

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos de lectura' + error });
  }
})

router.get('/comprobar-pagina/:idUsuario/:idLibro', validate.protegerRuta(''), async (req, res) => {
  try {
    let respuesta = false;
    const pagina_actual = parseInt(req.query.pagina_actual);  // Extraer de req.query y convertir a número
    const librosUsuarioSolicitado = [];
    // Busca el registro del libro leído por el usuario
    const libroLeido = await LibroLeidoModel.find({ id_libro: req.params.idLibro });

    if (!libroLeido) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
   
    // Si no hay registros del libro leído por el usuario, respuesta es true y termina la ejecución
    if (libroLeido.length === 0) {
      return res.send({ ok: true, resultado: true });
    }

    libroLeido.forEach(resp => {
      if (resp.id_usuario == req.params.idUsuario) {
        librosUsuarioSolicitado.push(resp);
      }
    });

   

    // Ordenar por fechas (más reciente a más antigua)
    librosUsuarioSolicitado.sort((a, b) => new Date(b.fecha_lectura) - new Date(a.fecha_lectura));
    //console.log('Pagina del libro guardado: ' + librosUsuarioSolicitado[0].pagina_actual);
    //console.log('Pagina que me mandan: ' + pagina_actual);

    // Si la página actual es menor que la última registrada, respuesta es true
    if (librosUsuarioSolicitado[0].pagina_actual < pagina_actual) {
      respuesta = true;
    }

    res.send({ ok: true, resultado: respuesta });

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos de lectura' + error });
  }
});



//DEVOLVER TODOS LOS LIBROS LEIDOS POR UN USUARIO
router.get('/usuario/:id', validate.protegerRuta(''),  async (req, res) => {
  try {
    
    // Busca el registro del libro leído por el usuario
    const libroLeido = await LibroLeidoModel.find({ id_usuario: req.params.id })
    .sort({ fecha: -1 })
    .populate({
      path: 'id_usuario',
      populate: [
        { path: 'ID_POBLACION' },  
        { path: 'AMIGOS' }
      ]
    })
    .populate({
      path: 'id_libro',
      populate: [
        { path: 'added_usuario' },  
        { path: 'categorias_libro' },
        { path: 'generos_libro' },
        { path: 'resenas_libro' },
      ]
    })
    .exec();

    if (!libroLeido) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
   
    res.send({ ok: true, resultado: libroLeido});  

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos de lectura' + error });
  }
})

//AÑADIR UN LIBRO
router.post('/add-libro-leido', validate.protegerRuta(''),  async (req, res) => {
  try {
    const { id_usuario, id_libro, pagina_actual } = req.body; // Datos enviados en el cuerpo de la solicitud
    //const id_usuario = req.user.id; // Obtén el ID del usuario del middleware de autenticación
    const pagina =  Number(pagina_actual)
    //console.log('QUIIIIII: ADD LIBRO LEIDO ' + id_usuario);
    
    // Valida que la página actual sea un número válido
    if (isNaN(pagina) || pagina < 0) {
      return res.status(400).json({ error: 'La página actual debe ser un número válido' });
    }

    // Crea un nuevo registro para el libro leído
    const nuevoLibroLeido = new LibroLeidoModel({
      id_usuario,
      id_libro,
      pagina_actual
    });

    // Guarda el nuevo libro leído
    await nuevoLibroLeido.save();
    //console.log('libro leido perfectamentee: ' + nuevoLibroLeido);
    res.status(201).json({ message: 'Libro leído añadido correctamente', nuevoLibroLeido });
  } catch (error) {
    res.status(500).json({ error: 'Error al añadir el libro leído' });
  }
})



// DELETE - PUT - ADD

module.exports = router;
