const { UnifiedOAuth } = require('./src/index');

// Example configuration
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
  },
  facebook: {
    clientId: 'your-facebook-client-id',
    clientSecret: 'your-facebook-client-secret',
    redirectUri: 'http://localhost:3000/auth/facebook/callback'
  }
});

// Example usage
async function example() {
  try {
    // Get available providers
    console.log('Available providers:', oauth.getAvailableProviders());
    
    // Get authorization URL for Google
    const googleAuthUrl = oauth.getAuthorizationUrl('google');
    console.log('Google auth URL:', googleAuthUrl);
    
    // Simulate OAuth callback (in real app, this would come from the callback URL)
    // const userData = await oauth.signIn('google', 'authorization-code-from-callback');
    // console.log('User data:', userData);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run example
example();
