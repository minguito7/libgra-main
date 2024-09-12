const mongoose = require('mongoose');
const libroSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    added_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    id_autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Autor', required: true },
    categorias_libro: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true }],
    isbn: { type: String, required: true },
    fecha_publicacion: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    generos_libro: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genero', required: true }],
    descripcion: { type: String },
    activo: { type: Boolean, default: true },
    archivo: { type: String }, // Aquí puedes guardar el nombre del archivo o la ruta al archivo si lo almacenas en el servidor
    portada: { type: String },
    resenas_libro: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resena'}],
});


// Crear el modelo de libro a partir del esquema
const LibroModel = mongoose.model('Libro', libroSchema);

module.exports = LibroModel;