const mongoose = require('mongoose');

// Esquema de reseña de un libro por un usuario
const contactoSchema = new mongoose.Schema({
    nombre: { type: String },
    apellidos: { type: String },
    telefono:{ type: String,required: true  },
    email:{ type: String, required: true  },
    sugerencia: { type: String, required: true },
    fechaAt: { type: Date, default: Date.now }
});

const ContactoModel = mongoose.model('Contacto', contactoSchema);

module.exports = ContactoModel;

