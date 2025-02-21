import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import moodRoutes from './routes/moodRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(cors())

app.get('/', (_req, res) => {
  res.send('Root route!')
})

app.use('/auth', authRoutes)
app.use('/mood', authMiddleware, moodRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
