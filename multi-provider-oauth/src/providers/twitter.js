const { BaseProvider } = require('./base');
const axios = require('axios');

class TwitterProvider extends BaseProvider {
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'tweet.read users.read',
      state: 'random_string',
      code_challenge: 'challenge',
      code_challenge_method: 'plain'
    });
    
    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post('https://api.twitter.com/2/oauth2/token', {
        code: code,
        grant_type: 'authorization_code',
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        code_verifier: 'challenge'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        }
      });

      return response.data.access_token;
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async getUserInfo(token) {
    try {
      const response = await axios.get('https://api.twitter.com/2/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          'user.fields': 'id,name,username,profile_image_url'
        }
      });

      return {
        id: response.data.data.id,
        name: response.data.data.name,
        email: '', // Twitter API v2 doesn't provide email by default
        picture: response.data.data.profile_image_url,
        provider: 'twitter'
      };
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.response?.data?.detail || error.message}`);
    }
  }
}

module.exports = { TwitterProvider };
