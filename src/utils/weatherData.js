import axios from 'axios'

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
const OPENWEATHER_BASE_URL = process.env.OPENWEATHER_BASE_URL

/**
 * Converts weather data from OpenWeatherMap format to our database schema format
 * @param {Object} weatherData - Raw weather data from OpenWeatherMap
 * @returns {Object} Formatted weather data matching our schema
 */
const formatWeatherData = (weatherData) => {
  return {
    temperature: weatherData.main.temp - 273.15, // Convert Kelvin to Celsius
    humidity: weatherData.main.humidity,
    pressure: weatherData.main.pressure,
    windSpeed: weatherData.wind.speed,
    cloudCover: weatherData.clouds.all,
    precipitation: weatherData.rain ? weatherData.rain['1h'] || 0 : 0,
    weatherType: weatherData.weather[0].main.toLowerCase(),
    description: weatherData.weather[0].description,
    feelsLike: weatherData.main.feels_like - 273.15,
  }
}

/**
 * Get current weather data for a given location
 * @param {Object} params - Location parameters
 * @param {number} params.latitude - Latitude coordinate
 * @param {number} params.longitude - Longitude coordinate
 * @returns {Promise<Object>} Formatted weather data
 */
export const getCurrentWeather = async ({ latitude, longitude }) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeatherMap API key not configured')
    }

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required')
    }

    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY,
      },
      timeout: 5000,
    })

    if (response.status !== 200) {
      throw new Error(`Weather API returned status ${response.status}`)
    }

    return formatWeatherData(response.data)
  } catch (error) {
    if (error.response) {
      console.error('Weather API error:', error.response.data)
      throw new Error(`Weather API error: ${error.response.data.message}`)
    } else if (error.request) {
      console.error('Weather API timeout or network error')
      throw new Error('Unable to fetch weather data: Network error')
    } else {
      console.error('Weather service error:', error.message)
      throw error
    }
  }
}

/**
 * Get historical weather data for a specific date and location
 * @param {Object} params - Query parameters
 * @param {number} params.latitude - Latitude coordinate
 * @param {number} params.longitude - Longitude coordinate
 * @param {Date} params.datetime - Target date and time
 * @returns {Promise<Object>} Formatted weather data
 */
export const getHistoricalWeather = async ({
  latitude,
  longitude,
  datetime,
}) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeatherMap API key not configured')
    }

    if (!latitude || !longitude || !datetime) {
      throw new Error('Latitude, longitude, and datetime are required')
    }

    // Convert datetime to Unix timestamp
    const timestamp = Math.floor(new Date(datetime).getTime() / 1000)

    // Check if the requested date is within the last 5 days
    const fiveDaysAgo = Math.floor(Date.now() / 1000) - 5 * 24 * 60 * 60

    let endpoint
    if (timestamp > fiveDaysAgo) {
      // Use 5 day/3 hour forecast history for recent dates
      endpoint = '/data/2.5/forecast'
    } else {
      // Use Historical Weather API for older dates
      endpoint = '/data/2.5/history/city'
    }

    const response = await axios.get(`${OPENWEATHER_BASE_URL}${endpoint}`, {
      params: {
        lat: latitude,
        lon: longitude,
        dt: timestamp,
        appid: OPENWEATHER_API_KEY,
      },
      timeout: 5000,
    })

    if (response.status !== 200) {
      throw new Error(`Weather API returned status ${response.status}`)
    }

    // For historical data, find the closest time to the requested datetime
    let closestWeatherData
    if (endpoint === '/data/2.5/forecast') {
      closestWeatherData = response.data.list.reduce((closest, current) => {
        const currentDiff = Math.abs(current.dt - timestamp)
        const closestDiff = Math.abs(closest.dt - timestamp)
        return currentDiff < closestDiff ? current : closest
      })
    } else {
      closestWeatherData = response.data
    }

    return formatWeatherData(closestWeatherData)
  } catch (error) {
    if (error.response) {
      console.error('Historical weather API error:', error.response.data)
      throw new Error(
        `Historical weather API error: ${error.response.data.message}`,
      )
    } else if (error.request) {
      console.error('Historical weather API timeout or network error')
      throw new Error('Unable to fetch historical weather data: Network error')
    } else {
      console.error('Historical weather service error:', error.message)
      throw error
    }
  }
}

/**
 * Get weather data by location name (current or historical)
 * @param {string} location - Location name (e.g., "London, UK")
 * @param {Date} [datetime] - Optional datetime for historical data
 * @returns {Promise<Object>} Formatted weather data
 */
export const getWeatherByLocation = async (location, datetime = null) => {
  try {
    const geocodingUrl = process.env.GEOCODING_URL

    const geoResponse = await axios.get(geocodingUrl, {
      params: {
        q: location,
        limit: 1,
        appid: OPENWEATHER_API_KEY,
      },
    })

    if (!geoResponse.data.length) {
      throw new Error(`Location not found: ${location}`)
    }

    const { lat, lon } = geoResponse.data[0]

    if (datetime) {
      return getHistoricalWeather({ latitude: lat, longitude: lon, datetime })
    } else {
      return getCurrentWeather({ latitude: lat, longitude: lon })
    }
  } catch (error) {
    console.error('Error getting weather by location:', error)
    throw new Error(`Unable to get weather for location: ${location}`)
  }
}
