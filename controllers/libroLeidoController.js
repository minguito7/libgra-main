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
    res.status(500).json({ error: 'Error al obtener los datos de lectura' + error });
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
    const pagina_actual = parseInt(req.query.pagina_actual);  // Extraer de req.query y convertir a número
    let respuesta = false;

    // Busca el registro del libro leído por el usuario
    const libroLeido = await LibroLeidoModel.find({ id_libro: req.params.idLibro, id_usuario: req.params.idUsuario });

    // Si no hay registros del libro leído por el usuario, añadir uno nuevo
    if (libroLeido.length === 0) {
      const nuevoRegistro = new LibroLeidoModel({
        id_libro: req.params.idLibro,
        id_usuario: req.params.idUsuario,
        pagina_actual: pagina_actual,
        fecha_lectura: new Date(), // Almacenar la fecha actual como fecha de lectura
      });

      // Guardar el nuevo registro
      const registroGuardado = await nuevoRegistro.save();
      console.log('Nuevo registro añadido:', registroGuardado);

      return res.send({ ok: true, resultado: true, mensaje: 'Registro añadido con éxito' });
    }

    // Si existen registros, filtrar por el usuario y proceder a la comparación
    const librosUsuarioSolicitado = [];
    libroLeido.forEach(resp => {
      if (resp.id_usuario == req.params.idUsuario) {
        librosUsuarioSolicitado.push(resp);
      }
    });

    // Ordenar por fechas (más reciente a más antigua)
    librosUsuarioSolicitado.sort((a, b) => new Date(b.fecha_lectura) - new Date(a.fecha_lectura));

    // Comparar la página actual con la última registrada
    if (librosUsuarioSolicitado[0].pagina_actual < pagina_actual) {
      respuesta = true;
    }

    res.send({ ok: true, resultado: respuesta });

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos de lectura: ' + error });
  }
});




//DEVOLVER TODOS LOS LIBROS LEIDOS POR UN USUARIO
router.get('/devolver/:id', validate.protegerRuta(''), async (req, res) => {
  try {
    console.log('ESTOY LEYENDO LOS LIBROS DE '+ req.params.id)
    let librosUnicos = [];
    // Obtener los distintos registros de libros leídos por el usuario, agrupados por id_libro
    const librosLeidos = await LibroLeidoModel.find()
      .populate({
        path: 'id_libro',
        populate: [
          { path: 'added_usuario' },
          { path: 'categorias_libro' },
          { path: 'generos_libro' },
          { path: 'resenas_libro' }
        ]
      }).exec();

      console.log('Libros leídos obtenidos:' + librosLeidos);

    if (!librosLeidos || librosLeidos.length === 0) {
      console.log('No se encontraron libros leídos.');
      return res.status(404).json({ error: 'No se encontraron registros de libros leídos' });
    }

    // Recorrer el array de libros leídos
    librosLeidos.forEach(libro => {
      // Verificar si el libro con el id_libro ya está en la lista de libros únicos
      if (!librosUnicos.some(libroUnico => libroUnico.id_libro._id.equals(libro.id_libro._id))) {
        librosUnicos.push(libro); // Si no está, lo agregamos
      }
    });

    // Imprimir los libros únicos para depurar
    console.log('Libros únicos leídos:'+ librosUnicos);

    // Retornar el número total de libros únicos leídos
    return res.send({ ok: true, resultado: librosUnicos });

  } catch (error) {
    console.error('Error al obtener los libros leídos:', error);
    return res.status(500).json({ error: 'Error al obtener los datos de lectura: ' + error });
  }
});




//AÑADIR UN LIBRO
router.post('/add-libro-leido', validate.protegerRuta(''), async (req, res) => {
  try {
    const { id_usuario, id_libro, pagina_actual } = req.body;
    const pagina = parseInt(pagina_actual);

    // Verificar que el usuario exista
    const usuario = await Usuario.findById(id_usuario).exec();

    // Valida que la página actual sea un número válido
    if (isNaN(pagina) || pagina < 0) {
      return res.status(400).json({ error: 'La página actual debe ser un número válido' });
    }

    // Crea un nuevo registro para el libro leído
    const nuevoLibroLeido = new LibroLeidoModel({
      id_usuario,
      id_libro,
      pagina_actual,
    });

    // Guarda el nuevo libro leído
    await nuevoLibroLeido.save();

    if (usuario) {
      // Verificar si el libro ya existe en el array LIBROS
      if (!usuario.LIBROS.includes(id_libro)) {
        console.log('Añadiendo el libro ' + id_libro + ' al usuario ' + id_usuario);
        usuario.LIBROS.push(id_libro);
        console.log('Este es el usuario al que hemos añadido el libro: ' + usuario.NOMBRE);
      } else {
        console.log('El libro ya está en la lista de libros leídos del usuario.');
      }

      // Guardar el usuario actualizado con el libro añadido
      await usuario.save();
    }

    res.status(201).json({ message: 'Libro leído añadido correctamente', nuevoLibroLeido });
  } catch (error) {
    res.status(500).json({ error: 'Error al añadir el libro leído' });
  }
});




// DELETE - PUT - ADD

module.exports = router;
