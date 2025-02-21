import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prismaClient.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { email, username, password, city, country } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      res
        .status(400)
        .json({ error: 'User already exists', message: email, success: false })
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        city,
        country,
      },
    })

    const data = {
      id: user.id,
      email: user.email,
      username: user.username,
      city: user.city,
      country: user.country,
      weatherUnit: user.weatherUnit,
      notificationEnabled: user.notificationsEnabled,
      shareData: user.shareData,
    }

    res
      .status(201)
      .json({ message: 'User created successfully', data, success: true })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({
      error: 'Error creating user',
      message: error.message,
      success: false,
    })
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
      res
        .status(401)
        .json({ error: 'Invalid credentials', message: email, success: false })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      res
        .status(401)
        .json({ error: 'Invalid credentials', message: email, success: false })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    })

    res.status(200).json({ token, message: 'Login successful', success: true })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({
      error: 'Error logging in',
      message: error.message,
      success: false,
    })
  }
})

export default router
