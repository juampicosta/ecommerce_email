import multer from 'multer'

// Configuración de multer para almacenar en memoria
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/html') {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos HTML'), false)
  }
}

const uploadHtml = multer({ storage, fileFilter })

export default uploadHtml
