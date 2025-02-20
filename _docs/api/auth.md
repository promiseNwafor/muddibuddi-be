# Authentication API Documentation

This documentation covers the authentication endpoints for user registration and login.

## Base URL

```
/auth
```

## Endpoints

### Register a New User

Creates a new user account in the system.

**Endpoint:** `POST /register`

#### Request Body

| Field    | Type   | Required | Description                  |
| -------- | ------ | -------- | ---------------------------- |
| email    | string | Yes      | User's email address         |
| username | string | Yes      | User's desired username      |
| password | string | Yes      | User's password (plain text) |

#### Success Response

- **Status Code:** 201 (Created)
- **Content-Type:** application/json

```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "password": "string (hashed)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Error Responses

- **Status Code:** 400 (Bad Request)

  - Returned when a user with the provided email already exists

  ```json
  {
    "error": "User already exists",
    "message": "user@example.com"
  }
  ```

- **Status Code:** 500 (Internal Server Error)
  - Returned when there's a server error during user creation
  ```json
  {
    "error": "Error creating user",
    "message": "Error details"
  }
  ```

### User Login

Authenticates a user and returns a JWT token.

**Endpoint:** `POST /login`

#### Request Body

| Field    | Type   | Required | Description                  |
| -------- | ------ | -------- | ---------------------------- |
| email    | string | Yes      | User's email address         |
| password | string | Yes      | User's password (plain text) |

#### Success Response

- **Status Code:** 200 (OK)
- **Content-Type:** application/json

```json
{
  "token": "JWT_TOKEN_STRING"
}
```

#### Error Responses

- **Status Code:** 401 (Unauthorized)

  - Returned when email doesn't exist or password is invalid

  ```json
  {
    "error": "Invalid credentials",
    "message": "user@example.com" // only included for email errors
  }
  ```

- **Status Code:** 500 (Internal Server Error)
  - Returned when there's a server error during login
  ```json
  {
    "error": "Error logging in",
    "message": "Error details"
  }
  ```

## Implementation Details

- Passwords are hashed using bcrypt with a salt round of 10
- JWT tokens expire after 24 hours
- JWT tokens are signed using the JWT_SECRET environment variable
- Database operations are performed using Prisma ORM
- Email addresses must be unique in the system

## Security Considerations

1. Passwords are never stored in plain text
2. Failed login attempts return generic error messages to prevent user enumeration
3. JWT tokens should be included in subsequent requests as Bearer tokens
4. All endpoints return appropriate HTTP status codes
5. Error messages are structured consistently across endpoints

## Example Usage

### Register Request

```javascript
fetch('/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'newuser',
    password: 'securepassword123',
  }),
})
```

### Login Request

```javascript
fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword123',
  }),
})
```

## Dependencies

- express: Web framework for handling HTTP requests
- bcryptjs: Password hashing library
- jsonwebtoken: JWT token generation and verification
- prisma: Database ORM for user management
