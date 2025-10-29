const { BaseProvider } = require('./base');
const axios = require('axios');

class FacebookProvider extends BaseProvider {
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'email,public_profile'
    });
    
    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          code: code
        }
      });

      return response.data.access_token;
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getUserInfo(token) {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me', {
        params: {
          fields: 'id,name,email,picture',
          access_token: token
        }
      });

      return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        picture: response.data.picture?.data?.url,
        provider: 'facebook'
      };
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = { FacebookProvider };
