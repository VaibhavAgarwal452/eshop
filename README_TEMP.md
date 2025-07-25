# E-Shop Microservices Application

A full-stack e-commerce application built with microservices architecture.

## Architecture
- Auth Service
- API Gateway  
- User UI (Next.js)
- Seller UI (Next.js)
- Shared packages and components

## Tech Stack
- Node.js
- Next.js
- Prisma
- Redis
- MongoDB
- TypeScript

## Getting Started
1. Install dependencies: `npm install`
2. Setup MongoDB replica set: `./setup-mongodb-replica.sh`
3. Run services: `nx serve <service-name>`

## Services
- `auth-service`: Authentication and authorization
- `api-gateway`: API routing and middleware
- `user-ui`: Customer-facing frontend
- `seller-ui`: Seller dashboard and management
