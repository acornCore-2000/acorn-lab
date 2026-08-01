# Acorn Lab 🌰
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green)

A full-stack social platform built with React, Express, PostgreSQL, and modern security practices.

## Overview

Acorn Lab is a secure full-stack social platform that allows users to create, manage, and discuss thoughts in real time.

The project was built to demonstrate modern full-stack development practices, including secure JWT authentication, refresh token rotation, real-time communication with Socket.IO, cloud file storage using AWS S3, and scalable PostgreSQL-based architecture.

Its primary goal is to showcase production-oriented backend design rather than simply implementing a CRUD application.

## Features

- Secure user authentication and authorization
- JWT access token & refresh token authentication
- Refresh token rotation with secure database storage
- HTTP-only cookie-based authentication
- Secure password hashing using bcrypt
- Protected API routes
- User profile management
- Avatar upload with AWS S3
- Real-time comments powered by Socket.IO
- PostgreSQL relational database
- Dark mode support
- Rate limiting against brute-force attacks
- Security middleware with Helmet
- Input validation and secure backend architecture

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS Modules
- Axios
- React Router
- Lucide React

### Backend

- Node.js
- Express
- PostgreSQL
- Socket.IO

### Security

- JWT authentication
- HTTP-only cookies
- bcrypt password hashing
- Helmet security middleware
- Express Rate Limit

## Architecture

```text
                React + Vite
                      │
                  Axios API
                      │
               Express Backend
          ┌───────────┴───────────┐
          │                       │
     PostgreSQL              Socket.IO
          │                       │
     User Data             Real-time Events
          │
        AWS S3
     Avatar Storage
```

## Installation

### Clone the repository

```bash
git clone https://github.com/acornCore-2000/acorn-lab.git
cd acorn-lab
```

### Install frontend dependencies

```bash
npm install
```

### Install backend dependencies

```bash
cd backend
npm install
```

### Run the application

Frontend:

```bash
npm run dev
```

Backend:

```bash
cd backend
npm run dev
```

## Future Improvements

- More advanced user interactions
- Improved testing coverage
- Additional performance optimizations

## Screenshots

### Posts
<img src="screenshots/posts.png" width="500">

### Profile
<img src="screenshots/profile.png" width="500">

### Comments
<img src="screenshots/comment-section.png" width="500">

### Login
<img src="screenshots/login-page.png" width="400">

### Mobile View
<img src="screenshots/mobile-view.png" width="300">


## License

This project is available under the MIT License.
