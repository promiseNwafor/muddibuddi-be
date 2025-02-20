import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/auth', authRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
