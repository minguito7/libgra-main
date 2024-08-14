const mongoose = require('mongoose');

// Define los roles permitidos como un array
const rolesPermitidos = ['lector', 'editor', 'admin', 'soid'];

const userSchema = new mongoose.Schema({
    DNI: { type: String, unique: true, required: true },
    NOMBRE: { type: String, lowercase: true },
    NAMEAPP: { type: String, lowercase: true, unique: true, required: true },
    APELLIDOS: { type: String, lowercase: true },
    EMAIL: { type: String, required: true, unique: true, lowercase: true },
    PASSWORD: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    FECHANAC: { type: Date, default: Date.now },
    DIRECCION: { type: String },
    ID_POBLACION: { type: mongoose.Schema.Types.ObjectId, ref: 'Poblacion' }, // Referencia al esquema de poblacion
    COD_POSTAL: { type: String },
    TITULO1: { type: String },
    SEXO: { type: String, lowercase: true },
    ROLE: { type: String,  enum: rolesPermitidos,  default: 'lector' },
    ACTIVO: { type: Boolean, default: 1 },
    NUM_USUARIO: { type: Number, unique: true },
    AVATAR: { type: String },
    AMIGOS: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }], // Referencia al esquema de usuario]
});

// Crear el modelo de usuario a partir del esquema
const UserModel = mongoose.model('Usuario', userSchema);

module.exports = UserModel;