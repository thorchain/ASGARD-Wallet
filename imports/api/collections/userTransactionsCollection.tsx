import { Mongo } from 'meteor/mongo';

const PersistentMinimongo2 = require('meteor/frozeman:persistent-minimongo2')

export type UserTransactionTypes = {
  _id?: string; 
  blockHeight: number; 
  code: number;
  confirmBlocks: number;
  data: any; 
  fromAddr: string; 
  memo: string; 
  orderId: string; 
  proposalId: string; 
  sequence: number; 
  source: number;
  timeStamp: Date; 
  toAddr: string; 
  txAge: number; 
  txAsset: string; 
  txFee: string; 
  txHash: string; 
  txType: string; 
  value: string; 
  // createdAt: Date;
  // updatedAt: Date;
}

const UserTransactions = new Mongo.Collection<UserTransactionTypes>(null);
UserTransactions.allow({
  insert: function(){ return true },
  update: function(){ return true }
});
export default UserTransactions
export const tokenDataObserver = new PersistentMinimongo2(UserTransactions, 'userTransactions');



