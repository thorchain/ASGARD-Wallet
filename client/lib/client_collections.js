// Used for user's account state
// SECURITY: This holds sensitive data
UserAccount = new Mongo.Collection(null);
UserAccount.allow({
  insert: function(){ return true }
});
