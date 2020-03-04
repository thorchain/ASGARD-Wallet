import React from 'react'
import { useTracker } from 'meteor/react-meteor-data';
import { UserTransactionTypes } from '/imports/api/collections/userTransactionsCollection'
import { UserTransactions } from '/client/lib/client_collections'

import TransactionsList from './transactionsList'

const UserTransactionsScreen: React.FC = (): JSX.Element => {
  // we get the transaction data here
  const userTransactions: UserTransactionTypes[] = useTracker(() => {
    const res = UserTransactions.find().fetch()
    
    return res
  }, [])
  return (
    <div className="row">
      <div className="col">
        <h5 className="text-center mb-4">Transactions</h5>
        <TransactionsList transactions={userTransactions} />
      </div>

    </div>
  )
}
export default UserTransactionsScreen