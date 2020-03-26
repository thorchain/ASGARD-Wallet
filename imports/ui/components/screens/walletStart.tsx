import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Row, Col, Button, Typography } from 'antd'
const { Title } = Typography

const StartScreen: React.FC = (): JSX.Element => {
  return (
    <Row>
      <Col xs={{span:12,offset:6}} md={{span:10,offset:7}} lg={{span:8,offset:8}} xl={{span:6,offset:9}}>
        <img src="/img/Asgard-Tri-Gradient.svg" width="100%" style={{padding:"32px"}}/>
      </Col>
      <Col md={{span:16,offset:4}} lg={{span:12,offset:6}} xl={{span:10,offset:7}}>

        <Title level={2}>Asgard Wallet</Title>
        <Button type="primary" size={'large'} className={'ant-btn-brand'} onClick={() => FlowRouter.go('walletCreate')}>
          New
        </Button>
        <Button type="primary" size={'large'} onClick={() => FlowRouter.go('walletImport')}>
          Import
        </Button>
        <div>
          <Title level={4}>Attention:</Title>
          <p className="text-justify"> This beta software is provided for testing purposes as is, with no warranty. Usage is restricted to Binance testnet.</p>
        </div>

      </Col>
    </Row>
  )
}
export default StartScreen
