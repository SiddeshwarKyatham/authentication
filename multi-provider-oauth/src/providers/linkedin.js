const { BaseProvider } = require('./base');
const axios = require('axios');

class LinkedInProvider extends BaseProvider {
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: ['r_emailaddress', 'r_liteprofile'],
      state: 'random_string'
    });
    
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    console.log(`      🔄 [LinkedIn] Exchanging code for token...`);
    try {
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log(`      ✅ [LinkedIn] Token exchange successful`);
      return response.data.access_token;
    } catch (error) {
      console.error(`      ❌ [LinkedIn] Token exchange failed: ${error.response?.data?.error_description || error.message}`);
      throw new Error(`Token exchange failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async getUserInfo(token) {
    console.log(`      🔄 [LinkedIn] Fetching user info from LinkedIn API...`);
    try {
      // Get basic profile info
      console.log(`      📋 [LinkedIn] Getting profile information...`);
      const profileResponse = await axios.get('https://api.linkedin.com/v2/people/~', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          projection: '(id,firstName,lastName,profilePicture(displayImage~:playableStreams))'
        }
      });

      // Get email address
      console.log(`      📧 [LinkedIn] Getting email address...`);
      const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: 'members',
          projection: '(elements*(handle~))'
        }
      });

      const firstName = profileResponse.data.firstName?.localized?.en_US || '';
      const lastName = profileResponse.data.lastName?.localized?.en_US || '';
      const name = `${firstName} ${lastName}`.trim();
      const email = emailResponse.data.elements?.[0]?.['handle~']?.emailAddress || '';

      const userInfo = {
        id: profileResponse.data.id,
        name: name,
        email: email,
        picture: profileResponse.data.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
        provider: 'linkedin'
      };
      
      console.log(`      ✅ [LinkedIn] User info retrieved successfully`);
      return userInfo;
    } catch (error) {
      console.error(`      ❌ [LinkedIn] Failed to get user info: ${error.response?.data?.message || error.message}`);
      throw new Error(`Failed to get user info: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = { LinkedInProvider };
