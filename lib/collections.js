// realted to batchinsert package on client
// https://github.com/meteor/meteor-feature-requests/issues/15
// Temporarily restricting to client side only until syncing service needed
if (Meteor.isClient) {

  // User Transaction Data
  UserTransactions = new Mongo.Collection(null) // try just a null connection
  UserTransactions.allow({
    insert: function(){ return true }
  });

  // Token related data
  TokenData = new Mongo.Collection(null)
  TokenData.allow({
    insert: function(){ return true }
  });

  // Market data for tokens
  MarketData = new Mongo.Collection(null)
  MarketData.allow({
    insert: function(){ return true }
  });
  
}
