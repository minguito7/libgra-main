const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
//
let router = express.Router();
const _ = require('underscore');
const Usuario = require('../models/userModel.js');
const multer = require('multer');
const sharp = require('sharp');

router.use(express.json());
let TOKEN_SECRET = 'secreto';
const titulos = {
    'hombre': 'Sr. ',
    'mujer': 'Sra. ',
    'otro': 'Sre. '
};
const validateController = require  ('./validate-token.js');

const directorioPadre = path.join(__dirname, '..');
let guardarImagen = path.join(directorioPadre, '/public/uploads/avatar/');



/* CODIFICAR EL PASSWORD */
async function codifyPassword(passwordBody) {
    try {
        if (!passwordBody) {
            throw new Error('No hay contraseña');
        }
        const saltos = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(passwordBody, saltos);

        return password;
    } catch (error) {
        throw error;
    }
}
/* DETERMINAR NAMEAPP, SI EXISTE UNO IGUAL DARLE OPCIONES DISTINTAS */
async function obtenerVariantesNickname(nickName) {
    const variantes = [];
    const maxVariantes = 5; // Número máximo de variantes sugeridas
    let suffix = 1;

    // Genera variantes hasta encontrar algunas disponibles
    while (variantes.length < maxVariantes) {
        const nuevoNickname = `${nickName}${suffix}`;
        const existe = await Usuario.findOne({ NAMEAPP: nuevoNickname });

        if (!existe) {
            variantes.push(nuevoNickname);
        }

        suffix++;
    }avatarPath

    return variantes;
}


/* DETERMINAR EL ULTIMO NUMERO DE USUARIO REGISTRADO EN LA APP */


async function obtenerUltimoUsuario() {
    try {
        // Consultar todos los usuarios ordenados por el ID de manera descendente

        const allUsuarios = await Usuario.find();
        let ultimoUsuario = 1;
        allUsuarios.forEach(usuario => {
            //console.log(usuario);
            if (usuario.NUM_USUARIO > ultimoUsuario) {
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

//-- lOGIN// Método para generar el token tras login correcto
let generarToken = (login, role) => {
    console.log(role);
    return jwt.sign({ login: login, role: role },
        TOKEN_SECRET, { expiresIn: 86400 });
};

/* SUBIR EL AVATAR A UNA CARPETA */
const storage = multer.diskStorage({

    destination: function(req, file, cb) {
        cb(null, guardarImagen)
    },
    filename: function(req, file, cb) {
        // console.log(file);

        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({ storage: storage });
//upload.single('myFile');

const uploadAvatar = (req, res) => {
    res.send({ data: 'Enviar un archivo' })
}

function calcularLetraDNI(dniNumeros) {
    // Tabla de letras
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';

    // Asegurarse de que dniNumeros tiene 8 dígitos y es un número
    if (!/^\d{8}$/.test(dniNumeros)) {
        throw new Error('El número del DNI debe tener 8 dígitos.');
    }

    // Convertir a número entero y calcular el módulo 23
    const modulo = parseInt(dniNumeros, 10) % 23;

    // Devolver la letra correspondiente
    return letras.charAt(modulo);
}

/*REGISTRO USUARIO*/

router.post('/registro', upload.single('myFile'), async (req, res) => {
    try {
        console.log('Request Body:', req.body);
console.log('Uploaded File:', req.file);

        const { DNI, NAMEAPP, PASSWORD, NOMBRE, APELLIDOS, EMAIL, DIRECCION, ID_POBLACION, COD_POSTAL, SEXO } = req.body;

        if(!DNI){
            return res.status(400).send({
                ok: false,
                error: "Error, NO HA INDICADO UN DNI"
            });
        }

        //COMPROBACIÓN SI CONCUERDA EL NUMERO DEL DNI CON LA LETRA
        // Y SI ESTAS COINCIDEN CON EL DNI PROPORCIONADO

        /*const numerosDNI = DNI.slice(0, 8);
        const letraDNI = await calcularLetraDNI(numerosDNI);
        const comproacion_valido_dni = numerosDNI+letraDNI;

        if (comproacion_valido_dni!=DNI) {
            return res.status(400).send({
                ok: false,
                error: "Error, este DNI no es valido, el numero no concuerda con la letra"
            });
        }*/

        // Comprobar si el DNI ya existe
        const comprobacion_existe_dni = await Usuario.findOne({ DNI });
        
        if (comprobacion_existe_dni) {
            return res.status(400).send({
                ok: false,
                error: "Error, este DNI ya existe"
            });
        }
        if(!NAMEAPP){
            return res.status(400).send({
                ok: false,
                error: "Error, TIENE QUE ESCOGER UN NOMBRE DE APLICACION"
            });
        }
        // Comprobar si el nickname ya existe
        const comprobacion_nickname = await Usuario.findOne({ NAMEAPP });
        if (comprobacion_nickname) {
            const variantes = await obtenerVariantesNickname(NAMEAPP);
            return res.status(400).send({
                ok: false,
                error: "Error, este nickname ya existe",
                sugerencias: variantes
            });
        }

        // Codificar la contraseña
        const passwordCodificada = await codifyPassword(PASSWORD);

        // Obtener el último número de usuario
        const detUltimoNum = await obtenerUltimoUsuario();

        // Si se envía un archivo de imagen
        if (req.file && req.file.mimetype.startsWith('image')) {
            const imageData = fs.readFileSync(req.file.path);
            imagenBase64 = `data:${req.file.mimetype};base64,${imageData.toString('base64')}`;
            fs.unlinkSync(req.file.path);
        } else if (req.body.imagen && req.body.imagen.startsWith('data:image')) {
            imagenBase64 = req.body.imagen;
        }

        // Determinar el título según el sexo

        const titulo1 = titulos[SEXO.toLowerCase()] || 'Sre. ';
        
        // Determinar la ruta del avatar
        const avatarPath = req.file ? req.file.path : 'public/uploads/avatar/prede.png';

        // Crear un nuevo usuario
        const nuevoUsuario = new Usuario({
            DNI,
            NOMBRE,
            NAMEAPP,
            APELLIDOS,
            EMAIL: EMAIL.toLowerCase(),
            PASSWORD: passwordCodificada,
            DIRECCION,
            ID_POBLACION,
            COD_POSTAL,
            SEXO: SEXO.toLowerCase(),
            NUM_USUARIO: detUltimoNum,
            TITULO1: titulo1,
            AVATAR: avatarPath
        });
        console.log(ID_POBLACION)
        // Guardar el nuevo usuario en la base de datos
        const usuarioGuardado = await nuevoUsuario.save();
        res.status(200).send({
            ok: true,
            resultado: usuarioGuardado
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ mensaje: 'Error en el registro' });
    }
});
/*  LOGIN* 
router.post('/login', async(req, res) => {
    
    const usuario = await Usuario.findOne({ EMAIL: req.body.EMAIL });
    if (!usuario) return res.status(400).json({ error: 'Usuario no encontrado' });
    console.log(usuario);
    const passValida = await bcrypt.compare(req.body.PASSWORD, usuario.PASSWORD);
    if (!passValida) return res.status(400).json({ error: 'contraseña no válida' })

    if (usuario && passValida) {
        res.send({ ok: true, token: generarToken(usuario.EMAIL, usuario.ROLE) });
    } else {
        res.send({ ok: false });
    }


})*/
router.post('/login', async (req, res) => {
    try {
        const { EMAIL, PASSWORD } = req.body;

        // Buscar usuario por correo electrónico o nameapp
        const usuario = await Usuario.findOne({
            $or: [
                { EMAIL: EMAIL },
                { NAMEAPP: EMAIL } // Utilizamos el mismo campo para buscar por email o nameapp
            ]
        });

        if (!usuario) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        // Verificar la contraseña
        const passValida = await bcrypt.compare(PASSWORD, usuario.PASSWORD);
        if (!passValida) {
            return res.status(400).json({ error: 'Contraseña no válida' });
        }

        // Si las credenciales son válidas, generar y devolver el token
        const token = generarToken(usuario.EMAIL, usuario.ROLE);
        res.send({ ok: true, token });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ mensaje: 'Error en el login' });
    }
});

// Ruta para validar el token
router.get('/validate-token', (req, res) => {
    // Obtener el token del encabezado Authorization
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ valid: false, message: 'Token no proporcionado' });
    }
  
    // Extraer el token (quitar 'Bearer ' del encabezado)
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    
    // Verificar y decodificar el token
    jwt.verify(token, TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        // Token inválido o expirado
        return res.status(401).json({ valid: false, message: 'Token inválido' });
      }
      const usuarioLogged = await Usuario.findOne({EMAIL: decoded.login});
      // Token válido
      console.log(usuarioLogged);
      res.json({ valid: true, usuarioLogged });
    });
  });

module.exports = router;
