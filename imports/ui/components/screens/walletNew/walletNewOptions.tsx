import React, {useState, useEffect } from 'react'
import { Session } from 'meteor/session'

import { Row, Col, Typography, Button } from 'antd'
const { Title } = Typography

const WalletNewOptionsScreen: React.FC = (): JSX.Element => {
  const [selectedNetwork, setSelectedNetwork] = useState('testnet')
  useEffect(() => {
    const net = Session.get('network')
    if (net) {setSelectedNetwork(net)}
  })
  const setNetwork = (param:string) => {
    setSelectedNetwork(param)
    Session.set('network', param)
  }
  const activeClass = (which:string) => {
    // override adding class because AntD has no 'success' color button...
    return which === selectedNetwork ? 'ant-button-success' : ''
  }
  return (
    <Row>
      <Col md={{span:16,offset:4}} lg={{span:12,offset:6}}>
        <Title level={4}>New Wallet Options</Title>
        <Button type="primary" size="large" block disabled>Test Wallet</Button>
        <label>Choose Network</label>
        <Row>
          <Col>
            <Button type="default" size="large" className={activeClass('testnet')} block onClick={(e) => setNetwork('testnet',e)}>Test Network</Button>
          </Col>
          <Col>
            <Button type="default" size="large" className={activeClass('mainnet')} block onClick={(e) => setNetwork('mainnet',e)}>Main Network</Button>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}
export default WalletNewOptionsScreen
