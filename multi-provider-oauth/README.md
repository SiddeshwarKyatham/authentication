# Multi-Provider OAuth

A unified OAuth interface for multiple providers (Google, Facebook, LinkedIn, Twitter, Instagram, Reddit, GitHub).

## Features

- 🔐 **Multiple OAuth Providers**: Google, GitHub, Facebook, LinkedIn, Twitter, Instagram, Reddit
- 🎯 **Unified Interface**: Same API for all providers
- 🛡️ **Error Handling**: Comprehensive error management
- 📦 **Lightweight**: Minimal dependencies
- 🔧 **Extensible**: Easy to add new providers
- 📚 **Well Documented**: Clear examples and documentation

## Installation

```bash
npm install multi-provider-oauth
```

## Quick Start

```javascript
const { UnifiedOAuth } = require('multi-provider-oauth');

// Initialize with your OAuth configurations
const oauth = new UnifiedOAuth({
  google: {
    clientId: 'your-google-client-id',
    clientSecret: 'your-google-client-secret',
    redirectUri: 'http://localhost:3000/auth/google/callback'
  },
  github: {
    clientId: 'your-github-client-id',
    clientSecret: 'your-github-client-secret',
    redirectUri: 'http://localhost:3000/auth/github/callback'
  }
});

// Get authorization URL
const authUrl = oauth.getAuthorizationUrl('google');
console.log('Redirect user to:', authUrl);

// Handle OAuth callback
const userData = await oauth.signIn('google', 'authorization-code');
console.log('User data:', userData);
```

## Supported Providers

| Provider | Status | Required Scopes |
|----------|--------|-----------------|
| Google | ✅ | `profile email` |
| GitHub | ✅ | `user:email` |
| Facebook | ✅ | `email,public_profile` |
| LinkedIn | ✅ | `r_liteprofile,r_emailaddress` |
| Twitter | ✅ | `tweet.read users.read` |
| Instagram | ✅ | `user_profile,user_media` |
| Reddit | ✅ | `identity` |

## API Reference

### `UnifiedOAuth(config)`

Creates a new OAuth instance with the specified provider configurations.

**Parameters:**
- `config` (Object): Provider configurations

**Example:**
```javascript
const oauth = new UnifiedOAuth({
  google: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redirectUri: 'http://localhost:3000/callback'
  }
});
```

### `getAuthorizationUrl(provider)`

Generates the OAuth authorization URL for the specified provider.

**Parameters:**
- `provider` (String): Provider name (google, github, facebook, etc.)

**Returns:** Authorization URL string

**Example:**
```javascript
const authUrl = oauth.getAuthorizationUrl('google');
// Redirect user to this URL
```

### `signIn(provider, code)`

Exchanges the authorization code for user data.

**Parameters:**
- `provider` (String): Provider name
- `code` (String): Authorization code from callback

**Returns:** Promise resolving to user data object

**Example:**
```javascript
const userData = await oauth.signIn('google', 'authorization-code');
console.log(userData);
// {
//   id: '123456789',
//   name: 'John Doe',
//   email: 'john@example.com',
//   picture: 'https://...',
//   provider: 'google'
// }
```

### `getAvailableProviders()`

Returns an array of configured provider names.

**Returns:** Array of provider names

**Example:**
```javascript
const providers = oauth.getAvailableProviders();
console.log(providers); // ['google', 'github', 'facebook']
```

## User Data Format

All providers return user data in a consistent format:

```javascript
{
  id: String,        // Provider-specific user ID
  name: String,      // User's display name
  email: String,     // User's email address
  picture: String,   // User's profile picture URL
  provider: String   // Provider name (google, github, etc.)
}
```

## Error Handling

The package includes custom error classes for better error handling:

```javascript
const { ConfigurationError, TokenExchangeError, UserInfoError } = require('multi-provider-oauth');

try {
  const userData = await oauth.signIn('google', code);
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.log('Configuration issue:', error.message);
  } else if (error instanceof TokenExchangeError) {
    console.log('Token exchange failed:', error.message);
  } else if (error instanceof UserInfoError) {
    console.log('Failed to get user info:', error.message);
  }
}
```

## Express.js Integration

Here's how to integrate with Express.js:

```javascript
const express = require('express');
const { UnifiedOAuth } = require('multi-provider-oauth');

const app = express();
const oauth = new UnifiedOAuth({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/auth/google/callback'
  }
});

// Initiate OAuth
app.get('/auth/google', (req, res) => {
  const authUrl = oauth.getAuthorizationUrl('google');
  res.redirect(authUrl);
});

// Handle OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const userData = await oauth.signIn('google', code);
    
    // Save user data to database, create session, etc.
    console.log('User logged in:', userData);
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth error:', error.message);
    res.redirect('/login?error=oauth_failed');
  }
});
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
