import express from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../utils/prismaClient.js'
import { analyzeMood } from '../utils/index.js'
import { getWeatherByLocation } from '../utils/weatherData.js'

const router = express.Router()

router.get('/entries', async (req, res) => {
  try {
    const mood_entries = await prisma.moodEntry.findMany({
      where: {
        userId: req.user.id,
      },
    })

    res.status(200).json({
      message: 'Mood entries fetched successfully',
      data: mood_entries,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching mood entries:', error)
    res.status(500).json({
      error: 'Error fetching mood entries',
      message: error.message,
      success: false,
    })
  }
})

router.post(
  '/entries',
  [
    body('moodText').isString().notEmpty().withMessage('Mood text is required'),
    body('entryDateTime')
      .isISO8601()
      .toDate()
      .withMessage('Invalid date format'),
  ],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: errors.array(),
        success: false,
      })
    }

    try {
      const {
        moodText,
        entryDateTime,
        country,
        saveAddress,
        city = null,
      } = req.body
      const userId = req.user.id

      const userData = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      if (!userData) {
        return res
          .status(404)
          .json({ error: 'User not found', message: userId, success: false })
      }

      const userCity = city || userData.city

      if (!userCity) {
        return res.status(400).json({
          error: 'City is required',
          message: 'No city provided!',
          success: false,
        })
      }

      const weatherData = await getWeatherByLocation(userCity, entryDateTime)

      const { moodLabel, moodScore, summary, color } =
        await analyzeMood(moodText)

      await prisma.moodEntry.create({
        data: {
          moodText,
          entryDateTime,
          moodLabel,
          moodScore,
          summary,
          color,
          userId,
          city: userCity,
          country: country || userData.country,
          weatherData: {
            create: {
              ...weatherData,
            },
          },
        },
        include: {
          weatherData: true,
        },
      })

      if (saveAddress) {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            city,
            country,
          },
        })
      }

      res.status(201).json({
        message: 'Mood entry created successfully',
        data: null,
        success: true,
      })
    } catch (error) {
      console.error('Error creating mood entry:', error)
      res.status(500).json({
        error: error.message,
        message: 'Error creating mood entry',
        success: false,
      })
    }
  },
)

export default router
