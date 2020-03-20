import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Row, Col, Button, Typography } from 'antd'
const { Title } = Typography
// const { Link } = Anchor;

const StartScreen: React.FC = (): JSX.Element => {
  return (
    <Row>
      <Col md={{span:16,offset:4}} lg={{span:12,offset:6}} xl={{span:16,offset:4}}>

        <img src="/img/Asgard-Wallet-Gradient-512.svg" />
        <Title level={4}>Asgard Wallet</Title>
        <Button type="primary" size={'large'} className={'ant-btn-brand'} onClick={() => FlowRouter.go('walletCreate')}>
          New
        </Button>
        <Button type="primary" size={'large'} onClick={() => FlowRouter.go('walletImport')}>
          Import
        </Button>

      </Col>
    </Row>
  )
}
export default StartScreen
