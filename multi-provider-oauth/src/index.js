const { GoogleProvider } = require('./providers/google');
const { GitHubProvider } = require('./providers/github');
const { FacebookProvider } = require('./providers/facebook');
const { LinkedInProvider } = require('./providers/linkedin');
const { TwitterProvider } = require('./providers/twitter');
const { InstagramProvider } = require('./providers/instagram');
const { RedditProvider } = require('./providers/reddit');
const { ConfigurationError, TokenExchangeError, UserInfoError } = require('./errors');

class UnifiedOAuth {
  constructor(config) {
    console.log('\n🔧 Initializing UnifiedOAuth...');
    console.log('   • Configuring providers...');
    
    this.providers = {};
    
    // Initialize configured providers
    Object.keys(config).forEach(providerName => {
      try {
        console.log(`   ⚙️  Setting up ${providerName.toUpperCase()} provider...`);
        const providerConfig = config[providerName];
        
        switch (providerName.toLowerCase()) {
          case 'google':
            this.providers.google = new GoogleProvider(providerConfig);
            console.log(`   ✅ Google provider initialized`);
            break;
          case 'github':
            this.providers.github = new GitHubProvider(providerConfig);
            console.log(`   ✅ GitHub provider initialized`);
            break;
          case 'facebook':
            this.providers.facebook = new FacebookProvider(providerConfig);
            console.log(`   ✅ Facebook provider initialized`);
            break;
          case 'linkedin':
            this.providers.linkedin = new LinkedInProvider(providerConfig);
            console.log(`   ✅ LinkedIn provider initialized`);
            break;
          case 'twitter':
            this.providers.twitter = new TwitterProvider(providerConfig);
            console.log(`   ✅ Twitter provider initialized`);
            break;
          case 'instagram':
            this.providers.instagram = new InstagramProvider(providerConfig);
            console.log(`   ✅ Instagram provider initialized`);
            break;
          case 'reddit':
            this.providers.reddit = new RedditProvider(providerConfig);
            console.log(`   ✅ Reddit provider initialized`);
            break;
          default:
            throw new ConfigurationError(`Unsupported provider: ${providerName}`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to initialize ${providerName}:`, error.message);
        throw new ConfigurationError(`Failed to initialize ${providerName} provider: ${error.message}`);
      }
    });
    
    console.log(`   📊 Total providers configured: ${Object.keys(this.providers).length}`);
    console.log(`   ✅ UnifiedOAuth ready!\n`);
  }

  getAuthorizationUrl(provider) {
    console.log(`\n🔗 Generating OAuth URL for ${provider.toUpperCase()}...`);
    
    if (!this.providers[provider]) {
      console.error(`   ❌ Provider ${provider} not configured`);
      throw new ConfigurationError(`Provider ${provider} not configured`);
    }
    
    const authUrl = this.providers[provider].getAuthorizationUrl();
    console.log(`   ✅ Generated URL: ${authUrl.substring(0, 50)}...`);
    
    return authUrl;
  }

  async signIn(provider, code) {
    console.log(`\n🔐 Starting OAuth flow for ${provider.toUpperCase()}...`);
    console.log(`   • Authorization code received`);
    
    if (!this.providers[provider]) {
      console.error(`   ❌ Provider ${provider} not configured`);
      throw new ConfigurationError(`Provider ${provider} not configured`);
    }
    
    try {
      console.log(`   🔄 Exchanging code for access token...`);
      const token = await this.providers[provider].exchangeCodeForToken(code);
      console.log(`   ✅ Token exchange successful`);
      
      console.log(`   👤 Fetching user information...`);
      const userInfo = await this.providers[provider].getUserInfo(token);
      console.log(`   ✅ User info retrieved:`);
      console.log(`      • ID: ${userInfo.id}`);
      console.log(`      • Name: ${userInfo.name}`);
      console.log(`      • Email: ${userInfo.email}`);
      console.log(`      • Provider: ${userInfo.provider}`);
      
      return userInfo;
    } catch (error) {
      console.error(`   ❌ OAuth flow failed:`, error.message);
      if (error instanceof TokenExchangeError || error instanceof UserInfoError) {
        throw error;
      }
      throw new Error(`OAuth flow failed for ${provider}: ${error.message}`);
    }
  }

  getAvailableProviders() {
    const providers = Object.keys(this.providers);
    console.log(`\n📋 Available providers:`, providers);
    return providers;
  }
}

module.exports = { UnifiedOAuth };
