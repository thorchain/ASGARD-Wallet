import React, { useMemo, useCallback }from 'react'
import { WALLET } from '/imports/startup/client/init'
// import { UserAccount } from '/imports/api/collections/client_collections'

import { Row, Col, Typography, Button } from 'antd'
const { Title } = Typography

const WalletNewOptionsScreen: React.FC = (): JSX.Element => {
  const lockWallet = useCallback(async () => {
    try {
      await WALLET.lock()
      FlowRouter.go('walletUnlock')
    } catch (error) {
      console.log(error)
    }
  },[])
  const setNetwork = useCallback(async () => {
    console.log("selecting network...")
    try {
      // await WALLET.resetWallet()
      // FlowRouter.go('walletStart') 
    } catch (error) {
      // console.log(error)
    }
  },[])
  return (
    <Row>
      <Col md={{span:16,offset:4}} lg={{span:12,offset:6}}>
        <Title level={4}>Import Options</Title>
        <Button type="primary" onClick={lockWallet} size="large">Lock Wallet</Button>
        <Button type="default" onClick={setNetwork} size="large">Network</Button>
      </Col>
    </Row>
  )
}
export default WalletNewOptionsScreen
