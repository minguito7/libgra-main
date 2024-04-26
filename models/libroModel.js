const libroSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    id_autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Autor', required: true },
    categorias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true }],
    isbn: { type: String, required: true, unique: true },
    fecha_publicacion: { type: Date, required: true },
    generos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genero', required: true }],
    descripcion: { type: String },
    activo: { type: Boolean, default: true },
    archivo: { type: String }, // Aquí puedes guardar el nombre del archivo o la ruta al archivo si lo almacenas en el servidor
    imagen: { type: String },
    resenas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resena'}],

});


// Crear el modelo de libro a partir del esquema
const LibroModel = mongoose.model('Libro', libroSchema);

module.exports = LibroModel;