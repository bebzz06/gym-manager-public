# Gym Manager App

A comprehensive gym management system for managing gym operations, memberships, and administrative tasks.

## Architecture

Full-stack TypeScript application using a monorepo structure with Lerna workspace management.

### Tech Stack

**Frontend**

- React 18 + TypeScript
- Vite + TailwindCSS
- Redux Toolkit for state management
- React Router for navigation

**Backend**

- Express.js + TypeScript
- MongoDB with Mongoose ODM
- JWT authentication
- Firebase Admin for file storage

**Infrastructure**

- Docker containerization
- Google Cloud Run (backend hosting)
- Firebase Hosting (frontend hosting)
- GitHub Actions CI/CD

## Key Features

- Member management and registration
- Payment processing integration
- File upload and storage via Firebase
- Multi-environment deployment (dev/staging/prod)
- Automated testing with Playwright
- Database migrations and backup system
