import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prismaClient.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { email, username, password, city, state } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      res.status(400).json({ error: 'User already exists', message: email })
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        city,
        state,
      },
    })

    res.status(201).json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    res
      .status(500)
      .json({ error: 'Error creating user', message: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials', message: email })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    })

    res.status(200).json({ token })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ error: 'Error logging in', message: error.message })
  }
})

export default router
