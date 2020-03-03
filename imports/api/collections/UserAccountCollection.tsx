import { Mongo } from 'meteor/mongo';

const PersistentMinimongo2 = require('meteor/frozeman:persistent-minimongo2')

export type UserAccountTypes = {
  _id?: string; // Why is this optional from standard example?
  address: string;
  keystore: any; // This is a nested object. TODO: Add types
  locked: boolean;
  pwHash: string;
  // TODO: Remove optional
  baseCurrency?: string; // Base currency for conversion rates etc.
  // createdAt: Date;
  // updatedAt: Date;
}

const UserAccount = new Mongo.Collection<UserAccountTypes>(null);
UserAccount.allow({
  insert: function(){ return true },
  update: function(){ return true }
});
export default UserAccount
export const userAccountObserver = new PersistentMinimongo2(UserAccount, 'userAccount');

