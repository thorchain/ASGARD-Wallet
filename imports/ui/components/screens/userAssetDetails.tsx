import React from 'react'
import { useTracker } from 'meteor/react-meteor-data'
import { UserAssets } from '/imports/api/collections/client_collections'
import { UserAssetsTypes } from '/imports/api/collections/userAssetsCollection'
import { UserTransactions } from '/imports/api/collections/client_collections'
import { UserTransactionTypes } from '/imports/api/collections/userTransactionsCollection'
import { TokenData } from '/imports/api/collections/client_collections'
import { TokenDataTypes } from '/imports/api/collections/tokenDataCollection'

import TransactionsTable from '/imports/ui/components/screens/transactions/transactionsTable'

import CircleIcon, { Sizes } from '/imports/ui/components/elements/circleIcon'
import Block from '/imports/ui/components/elements/Block/block'
import { Row, Col, Typography, Divider, Button, Card } from 'antd'
const { Title } = Typography

type Props = {symbol: string}
const UserAssetDetailsScreen: React.FC<Props> = ({symbol}): JSX.Element => {
  const balances: UserAssetsTypes = useTracker(() => {
    const res = UserAssets.findOne({symbol: symbol})
    res.full = parseFloat(res.free) + parseFloat(res.locked) + parseFloat(res.frozen)
    return res
  },[])
  const token: TokenDataTypes = useTracker(() => {
    return TokenData.findOne({symbol: symbol})
  },[])
  const userTransactions: UserTransactionTypes[] = useTracker(() => {
    return UserTransactions.find({txAsset:symbol},{sort: {timeStamp: -1}}).fetch()
  }, [])
  const freezable = () => balances.free > 0
  const unfreezable = () => balances.frozen > 0
  const sendable = () =>  balances.free > 0
  const goRoute = (route: string) => {
    const params = {symbol:symbol}
    switch (route) {
      case 'walletSend':
        sendable() && FlowRouter.go(route,params)
        break;
      case 'walletFreeze':
        freezable() && FlowRouter.go(route,params)
        break;
      case 'walletUnfreeze':
        unfreezable() && FlowRouter.go(route,params)
        break;
      case 'walletReceive':
        FlowRouter.go(route)
        break;
    
      default:
        break;
    }

  }

  return (
    <Row>
      <Col span={24} md={{span:16,offset:4}} lg={{span:12,offset:6}}>
        <Block layout vertical center>
          <Card bordered={false}>
            <CircleIcon shortSymbol={balances.shortSymbol} size={Sizes.lg} />
          </Card>
          <Title level={4}>{token.name} {balances.shortSymbol}</Title>
          <div>{balances.symbol}</div>
          <Title level={3}>{balances.full?.toLocaleString()} <small>{balances.shortSymbol}</small></Title>
        </Block>
      </Col>

      <Col span={24} md={{span:16,offset:4}} lg={{span:12,offset:6}}>
        <Block layout justifyAround>

          <Block layout vertical center>
            <div>Free:</div>
            <Title level={4}>{balances.free.toLocaleString()}</Title>
          </Block>

          <Block layout vertical center>
            <div>Frozen:</div>
            <Title level={4}>{balances.frozen.toLocaleString()}</Title>
          </Block>

          <Block layout vertical center>
            <div>Locked:</div>
            <Title level={4}>{balances.locked.toLocaleString()}</Title>
          </Block>

        </Block>
      </Col>

      <Divider/>

      <Col span={24} md={{span:16,offset:4}} lg={{span:12,offset:6}}>

        <Row>

          <Col span={12}>
            <Button type="primary" size="large" disabled={(!sendable())} onClick={() => goRoute('walletSend')}>Send</Button>
            <Block layout vertical center>
              <Button type="link" disabled={(!freezable())} onClick={() => goRoute('walletFreeze')}>Freeze</Button>
              <small>Freeze assets on address</small>
            </Block>
          </Col>

          <Col span={12}>
            <Button type="primary" size="large" onClick={() => goRoute('walletReceive')}>Receive</Button>
            <Block layout vertical center>
              <Button type="link" disabled={(!unfreezable())} onClick={() => goRoute('walletUnfreeze')}>Unfreeze</Button>
              <small>Unfreeze assets on address</small>
            </Block>
          </Col>

        </Row>

      </Col>
      <Divider/>
      <Col>
        <TransactionsTable transactions={userTransactions} />
      </Col>
    </Row>
  )
}
export default UserAssetDetailsScreen
