
const mongoose = require('mongoose');

const categoriaModel = new mongoose.Schema({
    
    nombre: { type: String, required: true , unique: true },
    num_categoria: { type: Number, unique: true }
});

const CategoriaModel = mongoose.model('Categoria', categoriaModel);
module.exports = CategoriaModel;
