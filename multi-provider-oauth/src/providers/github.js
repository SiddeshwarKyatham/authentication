const { BaseProvider } = require('./base');
const axios = require('axios');

class GitHubProvider extends BaseProvider {
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'user:email'
    });
    
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    console.log(`      🔄 [GitHub] Exchanging code for token...`);
    try {
      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code
      }, {
        headers: {
          Accept: 'application/json'
        }
      });

      console.log(`      ✅ [GitHub] Token exchange successful`);
      return response.data.access_token;
    } catch (error) {
      console.error(`      ❌ [GitHub] Token exchange failed: ${error.response?.data?.error_description || error.message}`);
      throw new Error(`Token exchange failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async getUserInfo(token) {
    console.log(`      🔄 [GitHub] Fetching user info from GitHub API...`);
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const userInfo = {
        id: response.data.id.toString(),
        name: response.data.name || response.data.login,
        email: response.data.email,
        avatar_url: response.data.avatar_url,
        provider: 'github'
      };
      
      console.log(`      ✅ [GitHub] User info retrieved successfully`);
      return userInfo;
    } catch (error) {
      console.error(`      ❌ [GitHub] Failed to get user info: ${error.response?.data?.message || error.message}`);
      throw new Error(`Failed to get user info: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = { GitHubProvider };
