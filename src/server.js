import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import moodRoutes from './routes/moodRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// require('dotenv').config()

// const http = require('http')
// const { neon } = require('@neondatabase/serverless')

// const sql = neon(process.env.DATABASE_URL)

// const requestHandler = async (req, res) => {
//   const result = await sql`SELECT version()`
//   const { version } = result[0]
//   res.writeHead(200, { 'Content-Type': 'text/plain' })
//   res.end(version)
// }

// http.createServer(requestHandler).listen(3000, () => {
//   console.log('Server running at http://localhost:3000')
// })

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/auth', authRoutes)
app.use('/mood', authMiddleware, moodRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
