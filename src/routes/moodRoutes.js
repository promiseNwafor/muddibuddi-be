import express from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../utils/prismaClient.js'
import { analyzeMood } from '../utils/index.js'
import { getWeatherByLocation } from '../utils/weatherData.js'

const router = express.Router()

router.get('/entries', async (req, res) => {
  try {
    const mood_entries = await prisma.moodEntry.findMany()

    res.status(200).json(mood_entries)
  } catch (error) {
    console.error('Error fetching mood entries:', error)
    res
      .status(500)
      .json({ error: 'Error fetching mood entries', message: error.message })
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
      return res
        .status(400)
        .json({ errors: errors.array(), message: errors.array() })
    }

    try {
      const { moodText, entryDateTime } = req.body
      const userId = req.user.id

      const userData = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      if (!userData) {
        return res
          .status(404)
          .json({ error: 'User not found', message: userId })
      }

      const weatherData = await getWeatherByLocation(userData.city)

      console.log({ weatherData })

      const { moodLabel, moodScore, summary } = await analyzeMood(moodText)

      await prisma.moodEntry.create({
        data: {
          moodText,
          entryDateTime,
          moodLabel,
          moodScore,
          summary,
          userId,
          city: userData.city,
          country: userData.country,
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

      res.status(201).json({ message: 'Mood entry created successfully' })
    } catch (error) {
      console.error('Error creating mood entry:', error)
      res
        .status(500)
        .json({ error: 'Error creating mood entry', message: error.message })
    }
  },
)

export default router
