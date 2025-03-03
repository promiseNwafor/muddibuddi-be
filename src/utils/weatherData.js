import axios from 'axios'

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
const OPENWEATHER_BASE_URL = process.env.OPENWEATHER_BASE_URL
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1'
const OPEN_METEO_ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive'

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
 * Converts weather data from Open-Meteo format to our database schema format
 * @param {Object} hourlyData - Hourly weather data from Open-Meteo
 * @param {number} hourIndex - Index of the hour to use
 * @returns {Object} Formatted weather data matching our schema
 */
const formatOpenMeteoData = (hourlyData, hourIndex) => {
  // Map weather codes to types and descriptions
  // Based on Open-Meteo WMO weather interpretation codes
  // https://open-meteo.com/en/docs
  const weatherCodes = {
    0: { type: 'clear', description: 'Clear sky' },
    1: { type: 'clear', description: 'Mainly clear' },
    2: { type: 'cloudy', description: 'Partly cloudy' },
    3: { type: 'cloudy', description: 'Overcast' },
    45: { type: 'fog', description: 'Fog' },
    48: { type: 'fog', description: 'Depositing rime fog' },
    51: { type: 'drizzle', description: 'Light drizzle' },
    53: { type: 'drizzle', description: 'Moderate drizzle' },
    55: { type: 'drizzle', description: 'Dense drizzle' },
    56: { type: 'drizzle', description: 'Light freezing drizzle' },
    57: { type: 'drizzle', description: 'Dense freezing drizzle' },
    61: { type: 'rain', description: 'Slight rain' },
    63: { type: 'rain', description: 'Moderate rain' },
    65: { type: 'rain', description: 'Heavy rain' },
    66: { type: 'rain', description: 'Light freezing rain' },
    67: { type: 'rain', description: 'Heavy freezing rain' },
    71: { type: 'snow', description: 'Slight snow fall' },
    73: { type: 'snow', description: 'Moderate snow fall' },
    75: { type: 'snow', description: 'Heavy snow fall' },
    77: { type: 'snow', description: 'Snow grains' },
    80: { type: 'rain', description: 'Slight rain showers' },
    81: { type: 'rain', description: 'Moderate rain showers' },
    82: { type: 'rain', description: 'Heavy rain showers' },
    85: { type: 'snow', description: 'Slight snow showers' },
    86: { type: 'snow', description: 'Heavy snow showers' },
    95: { type: 'thunderstorm', description: 'Thunderstorm' },
    96: { type: 'thunderstorm', description: 'Thunderstorm with slight hail' },
    99: { type: 'thunderstorm', description: 'Thunderstorm with heavy hail' },
  }

  const weatherCode = hourlyData.weathercode[hourIndex]
  const weather = weatherCodes[weatherCode] || {
    type: 'unknown',
    description: 'Unknown',
  }

  return {
    temperature: hourlyData.temperature_2m[hourIndex],
    humidity: hourlyData.relativehumidity_2m[hourIndex],
    pressure: hourlyData.surface_pressure[hourIndex],
    windSpeed: hourlyData.windspeed_10m[hourIndex],
    cloudCover: hourlyData.cloudcover[hourIndex],
    precipitation: hourlyData.precipitation[hourIndex],
    weatherType: weather.type,
    description: weather.description,
    feelsLike: hourlyData.apparent_temperature[hourIndex],
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
 * Get historical weather data for a specific date and location using Open-Meteo
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
    if (!latitude || !longitude || !datetime) {
      throw new Error('Latitude, longitude, and datetime are required')
    }

    const targetDate = new Date(datetime)

    // Format dates as YYYY-MM-DD required by Open-Meteo
    const formattedDate = targetDate.toISOString().split('T')[0]

    // Get the target hour (0-23)
    const targetHour = targetDate.getUTCHours()

    const response = await axios.get(OPEN_METEO_ARCHIVE_URL, {
      params: {
        latitude,
        longitude,
        start_date: formattedDate,
        end_date: formattedDate,
        hourly: [
          'temperature_2m',
          'relativehumidity_2m',
          'precipitation',
          'weathercode',
          'surface_pressure',
          'cloudcover',
          'windspeed_10m',
          'apparent_temperature',
        ].join(','),
        timezone: 'GMT',
      },
      timeout: 10000,
    })

    if (response.status !== 200) {
      throw new Error(`Open-Meteo API returned status ${response.status}`)
    }

    // Format the data using our custom formatter
    return formatOpenMeteoData(response.data.hourly, targetHour)
  } catch (error) {
    if (error.response) {
      console.error('Historical weather API error:', error.response.data)
      throw new Error(
        `Historical weather API error: ${error.response.data.reason || 'Unknown error'}`,
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
    const geocodingUrl =
      process.env.GEOCODING_URL || `${OPENWEATHER_BASE_URL}/geo/1.0/direct`

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

    return getCurrentWeather({ latitude: lat, longitude: lon })

    // TODO: Add support for historical data correctly
    if (datetime) {
      return getHistoricalWeather({
        latitude: lat,
        longitude: lon,
        datetime,
      })
    } else {
      return getCurrentWeather({ latitude: lat, longitude: lon })
    }
  } catch (error) {
    console.error('Error getting weather by location:', error)
    throw new Error(`Unable to get weather for location: ${location}`)
  }
}
