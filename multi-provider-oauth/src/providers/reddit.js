const { BaseProvider } = require('./base');
const axios = require('axios');

class RedditProvider extends BaseProvider {
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      state: 'random_string',
      redirect_uri: this.redirectUri,
      duration: 'permanent',
      scope: 'identity'
    });
    
    return `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post('https://www.reddit.com/api/v1/access_token', {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri
      }, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MultiProviderOAuth/1.0.0'
        }
      });

      return response.data.access_token;
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async getUserInfo(token) {
    try {
      const response = await axios.get('https://oauth.reddit.com/api/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'MultiProviderOAuth/1.0.0'
        }
      });

      return {
        id: response.data.id,
        name: response.data.name,
        email: '', // Reddit API doesn't provide email by default
        picture: response.data.icon_img || '',
        provider: 'reddit'
      };
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.response?.data?.error || error.message}`);
    }
  }
}

module.exports = { RedditProvider };
