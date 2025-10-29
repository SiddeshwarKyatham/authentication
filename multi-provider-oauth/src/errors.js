class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

class TokenExchangeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TokenExchangeError';
  }
}

class UserInfoError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserInfoError';
  }
}

class OAuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OAuthError';
  }
}

module.exports = {
  ConfigurationError,
  TokenExchangeError,
  UserInfoError,
  OAuthError
};
