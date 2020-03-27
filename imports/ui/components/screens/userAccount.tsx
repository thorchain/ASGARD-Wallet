import React, { useMemo, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { UserAccount } from '/imports/api/collections/client_collections'
import { UserAccountTypes } from '/imports/api/collections/userAccountCollection';

import { WALLET } from '/imports/startup/client/init'
import { Row, Col, Typography, Button, Tabs } from 'antd';
const { TabPane } = Tabs;
const { Title, Text } = Typography

type ClientTypes = {network: string, chainId: string}
const UserAccountScreen: React.FC = (): JSX.Element => {
  // TODO: Make reactive when we handle connection errors
  const client: ClientTypes = useMemo(() => {
    let obj
    try {
      const res: any = WALLET.getClient() // Undefined source
      obj = {chainId:res.chainId,network:res.network}
    } catch (error) {
      console.log(error) // TODO: Only for dev debugging, handle
      obj = {chainId:"",network:""}
    }
    return obj
  },[])
  const userAccount: UserAccountTypes = useTracker(() => { return UserAccount.findOne()}, [])

  const downloadLink: string = useMemo(() => {
    const keystore: string = window.localStorage.getItem('binance') || ""
    return 'data:text/plain;charset=utf-8,' + encodeURIComponent(keystore)
  }, [])

  const fileName = () => userAccount.address.concat('-keystore.txt')

  const lockWallet = async () => {
    try {
      await WALLET.lock()
      FlowRouter.go('walletUnlock')
    } catch (error) {
      console.log(error)
    }
  }
  const removeWallet = async () => { 
    try {
      await WALLET.resetWallet()
      FlowRouter.go('walletStart') 
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Row>
      <Col>
        <Title level={4}>Account</Title>
      
        <Tabs defaultActiveKey="1" size="large">
          <TabPane tab="Testnet" key="1">
            <Row>
              <Col sm={{span:24}} md={{span:12}} lg={{span:6}}>
                <small><strong>Account</strong></small>
                <Text ellipsis>{userAccount.address}</Text>
              </Col>
              <Col sm={{span:24}} md={{span:12}} lg={{span:6}}>
                <small><strong>Keystore Version</strong></small>
                <Text>{userAccount.keystore.version}</Text>
              </Col>
              <Col sm={{span:24}} md={{span:12}} lg={{span:6}}>
                <small><strong>Network</strong></small>
                <Text className="text-capitalize">{client.network}</Text>
              </Col>
              <Col sm={{span:24}} md={{span:12}} lg={{span:6}}>
                <small><strong>Chain ID</strong></small>
                <Text className="text-capitalize">{client.chainId}</Text>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Mainnet" key="2">
            <div>Coming soon...</div>
          </TabPane>
        </Tabs>

        <Row>

          <Col md={{span:16,offset:4}} lg={{span:14,offset:5}} xl={{span:12,offset:6}}>
            <Button type="primary" onClick={lockWallet} size="large" style={{marginTop:"32px",marginBottom:"32px"}}>Lock Wallet</Button>
        
            <Title level={4}>Wallet Management</Title>
            <div className="input-group">
              <Button type="primary" size="large" disabled={true}>View Phrase</Button>
              <a href={downloadLink} download={fileName()} className="ant-btn ant-btn-lg ant-btn-primary">Export Keystore</a>
            </div>
            <Button type="danger" size="large" onClick={removeWallet}>Remove Wallet</Button>
        
          </Col>

        </Row>
      
      </Col>

    </Row>
  )
}

export default UserAccountScreen