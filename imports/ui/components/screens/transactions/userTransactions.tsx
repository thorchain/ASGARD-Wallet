import React from 'react'
import { useTracker } from 'meteor/react-meteor-data';
import { UserTransactionTypes } from '/imports/api/collections/userTransactionsCollection'
import { UserTransactions } from '/imports/api/collections/client_collections'

import TransactionsList from './transactionsList'
import { Row, Col, Typography } from 'antd';
const { Title } = Typography

const UserTransactionsScreen: React.FC = (): JSX.Element => {
  const userTransactions: UserTransactionTypes[] = useTracker(() => {
    return UserTransactions.find({},{sort: {timeStamp: -1}}).fetch()
  }, [])
  return (
    <Row>
      <Col>
        <Title level={4}>Transactions</Title>
        <TransactionsList transactions={userTransactions} />
      </Col>
    </Row>
  )
}
export default UserTransactionsScreen