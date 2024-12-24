# Marketing SaaS - Dynamic Content Platform

A powerful marketing platform that allows you to serve dynamic content based on various conditions like time of day, weather, and temperature. Built with Next.js, Express, and Prisma.

## Features

- **Dynamic Content Variations**: Serve different content based on:
  - Time of day (Morning, Afternoon, Evening, Night)
  - Weather conditions (Sunny, Cloudy, Rainy, Snowy)
  - Temperature ranges
- **Project Management**: Create and manage multiple projects
- **Domain Validation**: Control which domains can use your dynamic scripts
- **Easy Integration**: Simple script tag integration for any website
- **Real-time Updates**: Content updates without page reload
- **Secure Authentication**: JWT-based authentication system

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **API Integration**: OpenWeatherMap API for weather data
- **Development**: Nx monorepo

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- PostgreSQL (via Docker)
- OpenWeatherMap API key

## Local Development Setup

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd marketing-saas
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:

   ```env
   # Database Configuration
   DATABASE_URL="postgresql://db_user:postgres@localhost:5432/marketing_saas_db?schema=public"
   POSTGRES_USER=db_user
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=marketing_saas_db

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h

   # API Configuration
   PORT=3000
   NEXT_PUBLIC_API_URL=http://localhost:3000/api

   # OpenWeather API
   OPENWEATHER_API_KEY=your-api-key
   ```

4. **Start the Database**

   ```bash
   docker-compose up -d
   ```

5. **Run Database Migrations**

   ```bash
   npx prisma migrate dev
   ```

6. **Start the Development Servers**

   In separate terminals:

   ```bash
   # Start the backend server
   npx nx serve server

   # Start the frontend development server
   npx nx serve frontend
   ```

   The application will be available at:

   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000/api

## Project Structure

```
marketing-saas/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   │   ├── app/          # Next.js app directory
│   │   ├── services/     # Frontend services
│   │   └── types/        # TypeScript types
│   └── server/           # Express backend application
│       ├── src/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── routes/
│       │   └── services/
├── libs/
│   └── prisma/           # Shared Prisma configuration
└── docker-compose.yml    # Docker configuration
```

## Usage

1. **Create an Account**

   - Sign up at `/signup`
   - Log in with your credentials

2. **Create a Project**

   - Navigate to the dashboard
   - Click "New Project"
   - Fill in project details

3. **Configure Conditions**

   - Go to project details
   - Add conditions for:
     - Time of day
     - Weather
     - Temperature
   - Specify variations for each condition

4. **Integration**

   - Add allowed domains
   - Copy the provided script tag
   - Add it to your website's HTML

5. **Testing**
   - The script will automatically:
     - Check current conditions
     - Update URL parameters
     - Trigger content variations

## Available Scripts

```bash
# Development
npx nx serve frontend    # Start frontend development server
npx nx serve server     # Start backend development server

# Building
npx nx build frontend   # Build frontend for production
npx nx build server    # Build backend for production

# Testing
npx nx test frontend    # Run frontend tests
npx nx test server     # Run backend tests

# Linting
npx nx lint frontend    # Lint frontend code
npx nx lint server     # Lint backend code
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@example.com or create an issue in the repository.
