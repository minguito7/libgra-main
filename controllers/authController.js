const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsontoken');
const fs = require('fs');

let router = express.Router();
const validates = require('.validate-token.js');
const _ = require('underscore');
const Usuario = ('../models/userModel.js');
let TOKE_SECRETO = 'secreto';
router.use(express.json());


/* CODIFICAR EL PASSWORD */
async function codifyPassword(passwordBody){
  const saltos = await bcrypt.genSalt(10);
  let password;
  return password = await bcrypt.hash(passwordBody,saltos);
}

/* DETERMINAR EL ULTIMO NUMERO DE USUARIO REGISTRADO EN LA APP */


async function obtenerUltimoUsuario() {
  try {
      // Consultar todos los usuarios ordenados por el ID de manera descendente
      
      const allUsuarios = await Usuario.find();
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

/*REGISTRO USUARIO*/

router.post('/registro', async(req, res) =>{
 try{

  let titulo1;
  const password = await codifyPassword(req.body.PASSWORD);
  const detUltimoNum = await obtenerUltimoUsuario();

  if(req.body.AVATAR != ''){
    let avatar = req.body.AVATAR;
    let base64Image = avatar.split(';base64,').pop();
    // TODO
    //FALTA DETERMINAR EL TIPO DE LA IMAGEN
    let rutaImagen = Date.now()+ 'avatar' + req.body.NOMBRE + '.png' ;
     // Crear un nuevo usuario
     const nuevoUsuario = new Usuario({
      DNI: req.body.DNI,
      NOMBRE:req.body.NOMBRE,
      APELLIDOS: req.body.APELLIDOS,
      EMAIL:req.body.EMAIL,
      PASSWORD: password,
      DIRECCION: req.body.DIRECCION,
      ID_POBLACION: req.body.ID_POBLACION,
      COD_POSTAL: req.body.COD_POSTAL,
      SEXO: req.body.SEXO,
      NUM_USUARIO : detUltimoNum,
    });
    
    if(req.body.SEXO === 'hombre'){
      titulo1 = 'Sr. ';
    }
    else if(req.body.SEXO === 'mujer'){
      titulo1= 'Sra. ';
    }
    else{
      titulo1= 'Sre. ';
    }
    nuevoUsuario.TITULO1 = titulo1;
    //GUARDAR LA IMAGEN EN UN DIRECTORIO
    fs.writeFile('public/uploads/avatar/' + rutaImagen + base64Image, {encoding: 'base64'}, (error)=>{
      nuevoUsuario.AVATAR = 'public/uploads/avatar/' + rutaImage;
      nuevoUsuario.then(x =>{
        
        res.status(200).send({
          ok: true,
          resultado: x
        })
      }).catch(err => {
        res.status(400).send({
          ok: false,
          error: "Error guardando la foto del el usuario" + err
        });
      });

    });
  }else{
    /*TODO
    CUANDO NO MANDEN IMAGEN PONER UNA PREDETERMINADA DEL SISTEMA
     */
    nuevoUsuario.save().then(x=>{
      res.status(200).send({
        ok: true,
        resultado: x
      })
    }).catch(err => {
      res.status(400).send({
        ok: false,
        error: "Error guardando el usuario" + err
      });
    });
  }
}catch (error) {
  console.error('Error en el registro:', error);
  res.status(500).json({ mensaje: 'Error en el registro' });
}
  
})