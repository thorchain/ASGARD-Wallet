import { Mongo } from 'meteor/mongo';

const PersistentMinimongo2 = require('meteor/frozeman:persistent-minimongo2')

export type TokenDataTypes = {
  _id?: string; // Why is this optional from standard example?
  name: string;
  mintable: boolean;
  original_symbol: string;
  symbol: string;
  owner: string;
  total_supply: string; // Float as string
  // createdAt: Date;
  // updatedAt: Date;
}

const TokenData = new Mongo.Collection<TokenDataTypes>(null);
TokenData.allow({
  insert: function(){ return true },
  update: function(){ return true }
});
export default TokenData
export const tokenDataObserver = new PersistentMinimongo2(TokenData, 'tokenData');


