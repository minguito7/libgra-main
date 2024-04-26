const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    DNI:  { type: String, required: true},
    NOMBRE: { type: String, lowercase: true},
    APELLIDOS: { type: String, lowercase: true},
    EMAIL: { type: String, required: true, unique: true, lowercase: true },
    PASSWORD: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    FECHANAC: { type: Date, default: Date.now },
    DIRECCION:  { type: String },
    ID_POBLACION: { type: mongoose.Schema.Types.ObjectId, ref: 'Poblacion' }, // Referencia al esquema de poblacion
    COD_POSTAL: {type: String},
    TITULO1: {type: String},
    SEXO:  {type: String, lowercase: true},
    ROLE:  {type: String, default: 'lector'},
    ACTIVO: {type: Boolean, default: 1},
    NUM_USUARIO: {type: Number},
    AVATAR: {type: String}
  });

  // Crear el modelo de usuario a partir del esquema
  const UserModel = mongoose.model('UserModel', userSchema);
  
  module.exports = UserModel;