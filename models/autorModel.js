const mongoose = require('mongoose');

const autorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  fecha_nacimiento: { type: Date },
  nacionalidad: { type: String },
  generos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genero' }], 
  libros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Libro' }] // Array de referencias a documentos de género
  // Array de referencias a documentos de género
});

const AutorModel = mongoose.model('Autor', autorSchema);

module.exports = AutorModel;
