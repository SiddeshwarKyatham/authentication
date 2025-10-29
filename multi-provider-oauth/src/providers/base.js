const axios = require('axios');

class BaseProvider {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    
    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('clientId, clientSecret, and redirectUri are required');
    }
  }

  getAuthorizationUrl() {
    throw new Error('getAuthorizationUrl must be implemented by subclass');
  }

  async exchangeCodeForToken(code) {
    throw new Error('exchangeCodeForToken must be implemented by subclass');
  }

  async getUserInfo(token) {
    throw new Error('getUserInfo must be implemented by subclass');
  }
}

module.exports = { BaseProvider };
