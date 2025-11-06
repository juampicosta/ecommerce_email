import mongoose from 'mongoose'

export const dbConnect = async () => {
  try {
    const DB_URI = process.env.DB_URI
    await mongoose.connect(DB_URI)
    console.log('Conexión exitosa a la base de datos')
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message)
  }
}
