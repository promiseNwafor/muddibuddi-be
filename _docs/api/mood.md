# Mood Entry

This documentation covers the endpoints for managing mood entries, including fetching existing entries and creating new ones with mood analysis and weather data integration.

## Base URL

```
/mood
```

## Endpoints

### Fetch Mood Entries

Retrieves all mood entries from the database.

**Endpoint:** `GET /entries`

#### Success Response

- **Status Code:** 200 (OK)
- **Content-Type:** application/json

```json
{
  "message": "Mood entries fetched successfully",
  "data": [
    {
      "id": "string",
      "moodText": "string",
      "entryDateTime": "ISO 8601 date string",
      "moodLabel": "string",
      "moodScore": "number",
      "summary": "string",
      "userId": "string",
      "city": "string",
      "country": "string",
      "weatherData": {
        "temperature": "number",
        "condition": "string"
        // other weather-related fields
      }
    }
    // more mood entries...
  ],
  "success": true
}
```

#### Error Response

- **Status Code:** 500 (Internal Server Error)

  - Returned when there's a server error during fetching mood entries

  ```json
  {
    "error": "Error fetching mood entries",
    "message": "Error details",
    "success": false
  }
  ```

### Create a New Mood Entry

Creates a new mood entry with mood analysis and weather data based on the user's location.

**Endpoint:** `POST /entries`

#### Request Body

| Field         | Type   | Required | Description                                     |
| ------------- | ------ | -------- | ----------------------------------------------- |
| moodText      | string | Yes      | The text describing the user's mood.            |
| entryDateTime | string | Yes      | The date and time of the mood entry (ISO 8601). |

#### Success Response

- **Status Code:** 201 (Created)
- **Content-Type:** application/json

```json
{
  "message": "Mood entry created successfully",
  "data": null,
  "success": true
}
```

#### Error Responses

- **Status Code:** 400 (Bad Request)

  - Returned when validation errors occur

  ```json
  {
    "errors": [
      {
        "msg": "Mood text is required",
        "param": "moodText",
        "location": "body"
      }
      // more validation errors...
    ],
    "message": "Validation errors",
    "success": false
  }
  ```

- **Status Code:** 404 (Not Found)

  - Returned when the user is not found

  ```json
  {
    "error": "User not found",
    "message": "user_id",
    "success": false
  }
  ```

- **Status Code:** 500 (Internal Server Error)

  - Returned when there's a server error during mood entry creation

  ```json
  {
    "error": "Error creating mood entry",
    "message": "Error details",
    "success": false
  }
  ```

## Implementation Details

- **Mood Analysis**: Uses an AI service to analyze `moodText` and generate a mood label, score, and summary.
- **Weather Data**: Fetches weather data based on the user's location.
- **Database Operations**: Performed using Prisma ORM.
- **Authentication**: Requires user ID in the request, typically provided via authentication middleware.

## Security Considerations

1. Ensure user ID is validated and authenticated.
2. Handle errors gracefully to prevent exposing sensitive information.
3. Validate all input data to prevent injection attacks.
4. Use HTTPS to secure data in transit.

## Example Usage

### Fetch Mood Entries

```javascript
fetch('/mood/entries', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_JWT_TOKEN',
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error fetching mood entries:', error))
```

### Create a New Mood Entry

```javascript
fetch('/mood/entries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_JWT_TOKEN',
  },
  body: JSON.stringify({
    moodText: 'Feeling great after a productive day!',
    entryDateTime: '2025-02-15T14:48:00.000Z',
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error creating mood entry:', error))
```

## Dependencies

- **express**: Web framework for handling HTTP requests.
- **express-validator**: Input validation middleware.
- **prisma**: Database ORM for managing mood entries.
- **axios**: HTTP client for making requests to external APIs (e.g., Groq AI, weather service).
