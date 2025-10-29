const { BaseProvider } = require('./base');
const axios = require('axios');

class InstagramProvider extends BaseProvider {
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'user_profile,user_media',
      response_type: 'code'
    });
    
    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post('https://api.instagram.com/oauth/access_token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code: code
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data.access_token;
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.response?.data?.error_message || error.message}`);
    }
  }

  async getUserInfo(token) {
    try {
      const response = await axios.get('https://graph.instagram.com/me', {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: token
        }
      });

      return {
        id: response.data.id,
        name: response.data.username,
        email: '', // Instagram Basic Display API doesn't provide email
        picture: '', // Would need additional API call for profile picture
        provider: 'instagram'
      };
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = { InstagramProvider };
