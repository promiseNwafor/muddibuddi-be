import express from 'express'
import prisma from '../utils/prismaClient.js'

const router = express.Router()

router.get('/data', async (req, res) => {
  try {
    const userId = req.user.id
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      res
        .status(404)
        .json({ error: 'User not found', message: userId, success: false })
    }

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
      .status(200)
      .json({ data, message: 'User data fetched successfully', success: true })
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({
      error: 'Error fetching user',
      message: error.message,
      success: false,
    })
  }
})

export default router
