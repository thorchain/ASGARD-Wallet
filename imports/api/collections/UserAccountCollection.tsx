import { Mongo } from 'meteor/mongo';
// TODO: Add types for below
const PersistentMinimongo2 = require('meteor/PersistentMinimongo2')

export type UserAccountTypes = {
  _id?: string; // Why is this optional from standard example?
  address: string;
  keystore: any; // This is a nested objet. TODO: Add types
  locked: boolean;
  pwHash: string;
  // createdAt: Date;
  // updatedAt: Date;
}

const UserAccount = new Mongo.Collection<UserAccountTypes>(null);
UserAccount.allow({
  insert: function(){ return true }
});
export default UserAccount
export const userAccountObserver = new PersistentMinimongo2(UserAccount, 'userAccount');

