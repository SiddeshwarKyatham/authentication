# Multi-Provider OAuth Authentication System

A comprehensive authentication system with support for multiple OAuth providers including Google, Facebook, LinkedIn, Twitter, Instagram, Reddit, and GitHub.

## Project Structure

```
├── backend/              # Node.js/Express backend server
│   ├── middleware/      # Authentication middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── server.js        # Express server entry point
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   └── utils/       # Utility functions
│   └── public/
└── multi-provider-oauth/  # OAuth library with multiple provider support
    ├── src/
    │   ├── providers/   # Provider implementations
    │   └── index.js     # Main export
    └── example.js       # Usage examples
```

## Features

- **Multi-Provider Support**: Google, Facebook, LinkedIn, Twitter, Instagram, Reddit, GitHub
- **Session-Based Authentication**: Secure session management with Express sessions
- **MongoDB Integration**: User data stored in MongoDB with Mongoose ODM
- **React Frontend**: Modern UI with Tailwind CSS
- **Protected Routes**: Authentication middleware for protected endpoints
- **JWT Support**: JSON Web Token support for stateless authentication

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **OAuth credentials** from each provider you want to use

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/SiddeshwarKyatham/authentication.git
cd authentication
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Multi-Provider OAuth Library

The `multi-provider-oauth` library is already included in the backend dependencies, but if you need to install it separately:

```bash
cd multi-provider-oauth
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/your-database-name
# OR for MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# Session Secret
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Server Port
PORT=5000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:5000/auth/facebook/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:5000/auth/linkedin/callback

# Twitter OAuth
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_REDIRECT_URI=http://localhost:5000/auth/twitter/callback

# Instagram OAuth
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
INSTAGRAM_REDIRECT_URI=http://localhost:5000/auth/instagram/callback

# Reddit OAuth
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_REDIRECT_URI=http://localhost:5000/auth/reddit/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:5000/auth/github/callback
```

### Frontend Configuration

The frontend is configured to proxy requests to `http://localhost:5000` by default (see `frontend/package.json`).

## Running the Application

### Start the Backend

```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend will start on `http://localhost:5000`

### Start the Frontend

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication Routes

All authentication endpoints are prefixed with `/auth`

- **GET** `/auth/google` - Initiate Google OAuth
- **GET** `/auth/google/callback` - Google OAuth callback
- **GET** `/auth/facebook` - Initiate Facebook OAuth
- **GET** `/auth/facebook/callback` - Facebook OAuth callback
- **GET** `/auth/linkedin` - Initiate LinkedIn OAuth
- **GET** `/auth/linkedin/callback` - LinkedIn OAuth callback
- **GET** `/auth/twitter` - Initiate Twitter OAuth
- **GET** `/auth/twitter/callback` - Twitter OAuth callback
- **GET** `/auth/instagram` - Initiate Instagram OAuth
- **GET** `/auth/instagram/callback` - Instagram OAuth callback
- **GET** `/auth/reddit` - Initiate Reddit OAuth
- **GET** `/auth/reddit/callback` - Reddit OAuth callback
- **GET** `/auth/github` - Initiate GitHub OAuth
- **GET** `/auth/github/callback` - GitHub OAuth callback
- **GET** `/auth/logout` - Logout user
- **GET** `/auth/user` - Get current user session
- **GET** `/auth/test-db` - Test database connection

### API Routes

- **GET** `/api/users` - Get all users (protected)
- **GET** `/api/users/:id` - Get user by ID (protected)
- **PUT** `/api/users/:id` - Update user (protected)
- **DELETE** `/api/users/:id` - Delete user (protected)

## Setting Up OAuth Providers

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:5000/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set Valid OAuth Redirect URIs: `http://localhost:5000/auth/facebook/callback`
5. Copy App ID and App Secret to `.env`

### LinkedIn OAuth Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add redirect URL: `http://localhost:5000/auth/linkedin/callback`
4. Copy Client ID and Client Secret to `.env`

### Twitter OAuth Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Set callback URL: `http://localhost:5000/auth/twitter/callback`
4. Copy Client ID and Client Secret to `.env`

### Instagram OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app with Instagram product
3. Set redirect URI: `http://localhost:5000/auth/instagram/callback`
4. Copy Client ID and Client Secret to `.env`

### Reddit OAuth Setup

1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Create a new application
3. Set redirect URI: `http://localhost:5000/auth/reddit/callback`
4. Copy Client ID and Client Secret to `.env`

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:5000/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

## Usage Example

### Backend Authentication Flow

```javascript
const express = require('express');
const session = require('express-session');
const oauth = require('multi-provider-oauth');

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Configure OAuth provider
oauth.configure('google', {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: 'http://localhost:5000/auth/google/callback'
});

// Routes
app.get('/auth/google', oauth.authenticate('google'));
app.get('/auth/google/callback', oauth.callback('google'));
```

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm start  # React development server with hot reload
```

## Technologies Used

### Backend
- **Express.js** - Web framework
- **Mongoose** - MongoDB object modeling
- **express-session** - Session management
- **jsonwebtoken** - JWT support
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **multi-provider-oauth** - OAuth library

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - CSS framework
- **React Scripts** - Build tools

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

**Siddeshwar**

- GitHub: [@SiddeshwarKyatham](https://github.com/SiddeshwarKyatham)
- Email: kyathamsiddeshwar@gmail.com

## Support

If you encounter any issues or have questions, please open an issue on the [GitHub repository](https://github.com/SiddeshwarKyatham/authentication/issues).

