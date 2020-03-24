import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Row, Col, Button, Typography } from 'antd'
const { Title } = Typography

const StartScreen: React.FC = (): JSX.Element => {
  return (
    <Row>
      <Col md={{span:16,offset:4}} lg={{span:12,offset:6}} xl={{span:16,offset:4}}>

        <img src="/img/img/Asgard-Tri-Gradient.svg" />
        <Title level={4}>Asgard Wallet</Title>
        <Button type="primary" size={'large'} className={'ant-btn-brand'} onClick={() => FlowRouter.go('walletCreate')}>
          New
        </Button>
        <Button type="primary" size={'large'} onClick={() => FlowRouter.go('walletImport')}>
          Import
        </Button>
        <div>
          <div className="h5 text-uppercase text-center">Attention:</div>
          <p className="text-justify"> This beta software is provided for testing purposes as is, with no warranty. Usage is restricted to Binance testnet.</p>
        </div>

      </Col>
    </Row>
  )
}
export default StartScreen
