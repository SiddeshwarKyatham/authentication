const { BaseProvider } = require('./base');
const axios = require('axios');

class GoogleProvider extends BaseProvider {
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'profile email',
      access_type: 'offline',
      prompt: 'consent'
    });
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    console.log(`      🔄 [Google] Exchanging code for token...`);
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri
      });

      console.log(`      ✅ [Google] Token exchange successful`);
      return response.data.access_token;
    } catch (error) {
      console.error(`      ❌ [Google] Token exchange failed: ${error.response?.data?.error_description || error.message}`);
      throw new Error(`Token exchange failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async getUserInfo(token) {
    console.log(`      🔄 [Google] Fetching user info from Google API...`);
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const userInfo = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        picture: response.data.picture,
        provider: 'google'
      };
      
      console.log(`      ✅ [Google] User info retrieved successfully`);
      return userInfo;
    } catch (error) {
      console.error(`      ❌ [Google] Failed to get user info: ${error.response?.data?.error_description || error.message}`);
      throw new Error(`Failed to get user info: ${error.response?.data?.error_description || error.message}`);
    }
  }
}

module.exports = { GoogleProvider };
