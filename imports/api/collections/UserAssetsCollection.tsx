import { Mongo } from 'meteor/mongo';
// TODO: Add types for below
const PersistentMinimongo2 = require('meteor/PersistentMinimongo2')

export type UserAssetsTypes = {
  _id?: string; // Why is this optional from standard example?
  free: number;
  frozen: number; // This is a nested objet. TODO: Add types
  locked: number;
  full?: number;
  symbol: string;
  shortSymbol: string;
  // createdAt: Date;
  // updatedAt: Date;
}

const UserAssets = new Mongo.Collection<UserAssetsTypes>(null);
UserAssets.allow({
  insert: function(){ return true },
  update: function(){ return true }
});
export default UserAssets
export const userAccountObserver = new PersistentMinimongo2(UserAssets, 'userAssets');


