import React from 'react'

import { Row, Col, Typography, Tabs } from 'antd'
const { Title } = Typography
const { TabPane } = Tabs;

import ImportKeystoreForm from './walletImportKeystoreForm'
import ImportMnemonicForm from './walletImportMnemonicForm'

const ImportScreen: React.FC = (): JSX.Element => {
  return (
    <Row>
      <Col md={{span:16,offset:4}}>
        <Title level={4}>Import Existing</Title>
        <Tabs defaultActiveKey="1" size="large">
          <TabPane tab="Keystore" key="1">
            <ImportKeystoreForm/>
          </TabPane>
          <TabPane tab="Mnemonic" key="2">
            <ImportMnemonicForm/>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  )
}
export default ImportScreen

