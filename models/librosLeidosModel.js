const mongoose = require('mongoose');
// Esquema de libro leído por un usuario
const libroLeidoSchema = new mongoose.Schema({
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    id_libro: { type: mongoose.Schema.Types.ObjectId, ref: 'Libro', required: true },
    fecha_lectura: { type: Date, default: Date.now },
    pagina_actual: { type: Number, default: 0 } // Nuevo campo para la página actual
});

// Plugin para autoincrementar el ID
const LibroLeidoModel = mongoose.model('LibroLeido', libroLeidoSchema);

module.exports = LibroLeidoModel;