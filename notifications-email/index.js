import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import { dbConnect } from './config/bbdd.js'
import * as emailService from './rabbit/emailService.js'
import template from './routes/template.js'
import component from './routes/component.js'
import { authMiddleware } from './middlewares/authMiddleware.js'
import { permissionsMiddleware } from './middlewares/permissionsMiddleware.js'
import * as authObserver from './rabbit/auth.js'

const app = express()
const port = process.env.PORT || 3005

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.use(express.json())
app.use(authMiddleware)
app.use(permissionsMiddleware)

app.use('/api/template', template)
app.use('/api/component', component)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

dbConnect()

authObserver.init()
emailService.init()
