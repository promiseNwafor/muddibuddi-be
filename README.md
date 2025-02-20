# Project Name

## MuddiBuddi

A mood-weather correlation app

## 🚀 Features

- User registration with email and username
- Secure password hashing
- JWT-based authentication
- PostgreSQL database with Prisma ORM
- Input validation and error handling
- API documentation

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/promiseNwafor/muddibuddi-be.git
cd muddibuddi-be
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
PORT=3000
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Start the server:

```bash
npm run dev
```

## 🏗️ Project Structure

```
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── index.js
│   ├── utils/
│   │   ├── prismaClient.js
│   │   └── middleware/
│   ├── config/
│   └── app.js
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
│   └── api/
│       └── auth.md
├── tests/
├── .env
└── package.json
```

## 📚 API Documentation

### Authentication Endpoints

Detailed API documentation can be found in [\_docs/api/](_docs/api/auth.md)

Quick reference:

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user and receive JWT

## 🔒 Environment Variables

| Variable     | Description                 | Required |
| ------------ | --------------------------- | -------- |
| DATABASE_URL | PostgreSQL connection URL   | Yes      |
| JWT_SECRET   | Secret key for JWT tokens   | Yes      |
| PORT         | Server port (default: 3000) | No       |

## 🧪 Running Tests

```bash
npm run test
```

## 🚀 Deployment

1. Build the project:

```bash
npm run build
```

2. Start production server:

```bash
npm start
```

### Docker Deployment

```bash
docker build -t project-name .
docker run -p 8000:8000 project-name
```

## 📝 Development Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Write tests for new features
- Update documentation when making changes
- Use ESLint and Prettier for code formatting

## 🔄 API Response Formats

### Success Response

```json
{
  "data": {},
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "error": "Error type",
  "message": "Error details"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
