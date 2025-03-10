import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export const analyzeMood = async (moodText) => {
  try {
    const prompt = `
      Analyze the following mood entry and provide:
      1. A single word mood label (e.g., happy, sad, anxious, excited)
      2. A personalized summary of the mood entry using "you" to refer to the user (e.g., You express positive feelings after meeting an old friend...)
      3. A mood score from -1 to 1 where:
        * -1 is extremely negative
        * 0 is neutral
        * 1 is extremely positive
      4. A color representation for the mood based on the score:
        * Use a gradient from red (#FF0000) to green (#00FF00), where:
          - Red (#FF0000) represents extremely negative (-1)
          - Yellow (#FFFF00) represents neutral (0)
          - Green (#00FF00) represents extremely positive (1)
        * For scores between -1 and 1, interpolate the color accordingly.

      Provide the response in JSON format with 'label', 'summary', 'score', and 'color' keys.

      Mood entry: "${moodText}"
    `

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'gemma2-9b-it',
      temperature: 0.1,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    })

    try {
      const result = JSON.parse(completion.choices[0].message.content)

      return {
        moodLabel: result.label.toLowerCase(),
        moodScore: parseFloat(result.score),
        summary: result.summary,
        color: result.color,
      }
    } catch (error) {
      console.error('Error parsing Groq response:', error)
      throw new Error('Failed to analyze mood')
    }
  } catch (error) {
    console.error('Error creating Groq completion:', error)
    throw new Error('Failed to analyze mood')
  }
}
