const mongoose = require('mongoose');

// Esquema de reseña de un libro por un usuario
const resenaSchema = new mongoose.Schema({
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },
    id_libro: { type: mongoose.Schema.Types.ObjectId, ref: 'Libro', required: true },
    contenido: { type: String, required: true },
    calificacion: { type: Number, min: 1, max: 5 },
    fecha: { type: Date, default: Date.now }
});


const ResenaModel = mongoose.model('Resena', resenaSchema);

module.exports = ResenaModel;