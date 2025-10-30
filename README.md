# Financial Advisor API

A comprehensive NestJS-based financial advisor application that provides portfolio management, company analysis, and investment tracking capabilities.

## 🚀 Features

- **Portfolio Management**: Create and manage investment portfolios with contribution tracking
- **Company Analysis**: Real-time company data, metrics, and financial states
- **Market Indices**: Track S&P 500, NASDAQ, and other market indices
- **Investment Metrics**: Calculate and monitor key financial ratios (P/E, PEG, Enterprise Value ratios)
- **Authentication**: JWT-based authentication system
- **Caching**: Redis-powered caching for optimal performance
- **Real-time Data**: Scheduled data updates and external API integrations
- **Health Monitoring**: Built-in health checks and metrics

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Authentication**: Passport JWT
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer
- **Logging**: Pino logger
- **Testing**: Vitest
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- MongoDB
- Redis
- Docker (optional, for containerized setup)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd financial-advisor-nestjs
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Configure your environment variables
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   yarn migrate-mongo up
   ```

## 🚀 Running the Application

### Development Mode

```bash
# Start with hot reload and pretty logs
yarn start:dev

# Start with debug mode
yarn start:debug
```

### Production Mode

```bash
# Build the application
yarn build

# Start production server
yarn start:prod
```

### Docker Setup

```bash
# Development environment
docker-compose -f docker-compose.dev.yml up

# Production environment
docker-compose -f docker-compose.prod.yml up
```

## 🧪 Testing

```bash
# Run unit tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run all tests
yarn test:all

# Generate test coverage report
yarn test:cov

# Run end-to-end tests
yarn test:e2e

# Run tests with debugging
yarn test:debug
```

## 📝 Code Quality

```bash
# Format code
yarn format

# Check code formatting
yarn format-check

# Lint and fix issues
yarn lint

# Check linting without fixing
yarn lint-check
```

## 🌐 API Documentation

Once the application is running, you can access:

- **Swagger UI**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`
- **Metrics**: `http://localhost:3000/metrics`

## 📊 Key Modules

- **Companies**: Company data management and financial metrics
- **Portfolios**: Investment portfolio creation and tracking
- **Indices**: Market indices monitoring
- **Authentication**: User authentication and authorization
- **Health**: Application health monitoring
- **Metrics**: Performance and business metrics

## 🔒 Environment Variables

Key environment variables to configure:

```env
NODE_ENV=development
HTTP_SERVER_PORT=3000
CORS_BASE_URL=http://localhost:3000

# Database
MONGO_CONNECTION_STRING=mongodb://localhost:27017
MONGO_DATABASE_NAME=financialAdvisorDB

# Redis Cache
REDIS_CONNECTION_STRING=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Authentication
JWT_SECRET=your_jwt_secret

# External APIs
PROVIDER_API_TOKEN=your_api_token
PROVIDER_BASE_URL=https://api.provider.com
EXCHANGE_RATES_PROVIDER_APP_ID=your_exchange_rates_app_id
```

## 🔄 Database Migrations

```bash
# Run pending migrations
yarn migrate-mongo up

# Rollback last migration
yarn migrate-mongo down

# Check migration status
yarn migrate-mongo status
```

## 📈 Monitoring & Logging

- **Logs**: Application logs are written to `fa.log`
- **Health Checks**: Available at `/health` endpoint
- **Metrics**: Performance metrics at `/metrics` endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License - see the [LICENSE](LICENSE) file for details.
