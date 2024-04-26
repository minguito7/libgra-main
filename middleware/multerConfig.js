const multer = require('multer');

// Configuración para archivos PDF
const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/pdf');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  }
});

// Configuración para imágenes (PNG o JPG)
const imgStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/img');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Configuración para imágenes (PNG o JPG)
const imgUserStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads/imgUser');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  

// Configurar Multer
/*const uploadPDF = multer({ storage: pdfStorage }).single('pdfFile');
const uploadImage = multer({ storage: imgStorage }).single('imageFile');
const uploadImageUser = multer({ storage: imgUserStorage }).single('imageUserFile');*/

const uploadPDF = multer({ storage: pdfStorage });

module.exports = uploadPDF.single('pdfFile');
