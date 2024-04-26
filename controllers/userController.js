const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel.js');
const bcrypt = require('bcrypt');
// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un usuario por su ID
exports.getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const { DNI, NOMBRE, APELLIDOS, EMAIL, PASSWORD, DIRECCION, ID_POBLACION, COD_POSTAL, TITULO1, SEXO, IMAGEN } = req.body;
    let imagenUserPath;

    if (req.file) {
      // Leer el archivo y convertirlo a Base64
      const imagenBuffer = fs.readFileSync(req.file.path);
      const imagenBase64 = Buffer.from(imagenBuffer).toString('base64');
      imagenUserPath = `data:${req.file.mimetype};base64,${imagenBase64}`;

      // Eliminar el archivo después de obtener la cadena Base64
      fs.unlinkSync(req.file.path);
    }

    if (IMAGEN && IMAGEN.startsWith('data:image')) {
      // La imagen se envía en formato Base64, guardarla en la base de datos
      imagenUserPath = IMAGEN;
    } else {
      console.log(imagenUserPath)
      return res.status(400).json({ mensaje: 'NO ENCONTRAMOS NINGUNA IMAGEN', imagenUserPath });
    }
    if(!PASSWORD){
      return res.status(400).json({ mensaje: 'Contraseña inexistente', PASSWORD });

    }
    console.log(req.body);
    // Verificar si el usuario ya existe en la base de datos
    const usuarioExistente = await UserModel.findOne({ DNI });
    
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El usuario ya existe', usuarioExistente });
    }
    const ultimoNUM = await obtenerUltimoUsuario();
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);

    console.log(ultimoNUM);
    
    // Crear un nuevo usuario
    const nuevoUsuario = new UserModel({
      DNI,
      NOMBRE,
      APELLIDOS,
      EMAIL,
      PASSWORD: hashedPassword,
      DIRECCION,
      ID_POBLACION,
      COD_POSTAL,
      TITULO1,
      SEXO,
      NUM_USUARIO : ultimoNUM,
      IMAGEN: imagenUserPath
    });

    // Guardar el usuario en la base de datos
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado correctamente:', nuevoUsuario});
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ mensaje: 'Error en el registro' });
  }
}

// Actualizar un usuario existente
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let updatedUserData = req.body;

    // Verificar si se está enviando una nueva imagen de usuario
    if (req.file) {
      // Si hay una nueva imagen, actualiza la ruta de la imagen en los datos del usuario
      updatedUserData.foto = req.file.path;
    }

    // Actualizar el usuario en la base de datos
    const user = await UserModel.findByIdAndUpdate(userId, updatedUserData, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un usuario existente
exports.deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    user.ACTIVO = 0;
    await user.save();
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


async function obtenerUltimoUsuario() {
  try {
      // Consultar todos los usuarios ordenados por el ID de manera descendente
      
      const allUsuarios = await UserModel.find();
      let ultimoUsuario = 1;
      allUsuarios.forEach(usuario => {
        console.log(usuario);
        if(usuario.NUM_USUARIO > ultimoUsuario){
          ultimoUsuario = usuario.NUM_USUARIO
        } 
      });
   
      // Si se encontró un usuario, devolver su ID + 1, de lo contrario devolver 1
      if (ultimoUsuario > 0) {
          console.log(ultimoUsuario);
          return ultimoUsuario + 1;
      } else {
          return 1; // Establecer el ID en 1 si no hay usuarios
      }
  } catch (error) {
      console.error('Error al obtener el último NUM de usuario:', error);
      throw error; // Puedes manejar el error según sea necesario en tu aplicación
  }
}