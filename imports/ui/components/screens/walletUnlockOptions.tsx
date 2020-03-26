import React, { useMemo, useCallback }from 'react'
import { WALLET } from '/imports/startup/client/init'
import { UserAccount } from '/imports/api/collections/client_collections'

import { Row, Col, Typography, Button } from 'antd'
const { Title } = Typography


const UnlockOptionsScreen: React.FC = (): JSX.Element => {
  const downloadLink: string = useMemo(() => {
    const keystore: string = window.localStorage.getItem('binance') || ""
    return 'data:text/plain;charset=utf-8,' + encodeURIComponent(keystore)
  }, [])
  const fileName: string = useMemo(() => {
    const acc = UserAccount.findOne()
    return acc && acc.address.concat('-keystore.txt')
  }, [])
  const lockWallet = useCallback(async () => {
    try {
      await WALLET.lock()
      FlowRouter.go('walletUnlock')
    } catch (error) {
      console.log(error)
    }
  },[])
  const removeWallet = useCallback(async () => {
    try {
      await WALLET.resetWallet()
      FlowRouter.go('walletStart') 
    } catch (error) {
      console.log(error)
    }
  },[])
  return (
    <Row>
      <Col md={{span:16,offset:4}} lg={{span:12,offset:6}}>
        <Title level={4}>Options</Title>
        <Button type="primary" onClick={lockWallet} size="large">Lock Wallet</Button>
        <a href={downloadLink} download={fileName} className="ant-btn ant-btn-lg ant-btn-primary">Export Keystore</a>
        <Button type="danger" onClick={removeWallet} size="large">Remove Wallet</Button>
      </Col>
    </Row>
  )
}
export default UnlockOptionsScreen