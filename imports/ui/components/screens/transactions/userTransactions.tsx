import React from 'react'
import { useTracker } from 'meteor/react-meteor-data';
import { UserTransactionTypes } from '/imports/api/collections/userTransactionsCollection'
import { UserTransactions } from '/imports/api/collections/client_collections'

import TransactionsList from './transactionsList'

const UserTransactionsScreen: React.FC = (): JSX.Element => {
  const userTransactions: UserTransactionTypes[] = useTracker(() => {
    return UserTransactions.find({},{sort: {timeStamp: -1}}).fetch()
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