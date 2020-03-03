// Used for user's account state
// realted to batchinsert package on client
// https://github.com/meteor/meteor-feature-requests/issues/15
// Temporarily restricting to client side only until syncing service needed

// SECURITY: This holds potentially sensitive data
if (Meteor.isClient) {
  
  UserAccount = new Mongo.Collection(null);
  UserAccount.allow({
    insert: function(){ return true }
  });
  var userAccountObserver = new PersistentMinimongo2(UserAccount, 'userAccount');
  module.exports.UserAccount = UserAccount

  // User assets & balances
  UserAssets = new Mongo.Collection(null);
  UserAssets.allow({
    insert: function(){ return true }
  });
  var userAssetsObserver = new PersistentMinimongo2(UserAssets, 'userAssets');
  module.exports.UserAssets = UserAssets

  // User Transaction Data
  UserTransactions = new Mongo.Collection(null)
  UserTransactions.allow({
    insert: function(){ return true }
  });
  var userTransactionsOberserver = new PersistentMinimongo2(UserTransactions, 'userTransactions')
  module.exports.UserTransactions = UserTransactions

  // Token related data
  TokenData = new Mongo.Collection(null)
  TokenData.allow({
    insert: function(){ return true }
  });
  var tokenDataOberserver = new PersistentMinimongo2(TokenData, 'tokenData')
  module.exports.TokenData = TokenData

  // Market data for tokens
  MarketData = new Mongo.Collection(null)
  MarketData.allow({
    insert: function(){ return true }
  });
  var marketDataOberserver = new PersistentMinimongo2(TokenData, 'marketData')
  module.exports.MarketData = MarketData

}
