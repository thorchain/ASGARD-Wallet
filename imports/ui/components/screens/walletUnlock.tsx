import React, { useState, useCallback } from 'react'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { WALLET } from "/imports/startup/client/init"
import { WalletUnlockFormSchema, WalletUnlockFormBridge } from '/imports/lib/schemas/walletUnlockFormSchema'

import { Row, Col, Card } from 'antd'
import { AutoForm, AutoField, SubmitField } from 'uniforms-antd'
import { ErrorField } from '/imports/uniforms-antd-custom/'

const UnlockScreen: React.FC = (): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  const handleUnlockFormSubmit = useCallback((model:{password:string,pwHash:string}) => {
    setLoadingMsg('Unlocking')
    WALLET.unlockAndSync(model.password)
    .then(() => FlowRouter.go('walletAssets'))
    .catch(e => {
      setLoadingMsg('')
      throw Error(e)
    })
      
  },[])
  return (
    <Row>

      <Col sm={{span:24}} md={{span:16,offset:4}} lg={{span:14,offset:5}} xl={{span:9,offset:0}}>
        <Card bordered={false}><img className="mx-auto d-block w-25" src="/img/Asgard-Tri-Gradient.svg"/></Card>
      </Col>

      <Col sm={{span:24}} md={{span:16,offset:4}} lg={{span:14,offset:5}} xl={{span:12,offset:0}}>
        <AutoForm
          validator={{ clean: true }}
          model={WalletUnlockFormSchema.clean({})}
          schema={WalletUnlockFormBridge}
          onSubmit={handleUnlockFormSubmit}
        >
          <AutoField name="password" type="password" size='large' placeholder="enter password" label={false}/>
          <ErrorField name='password'/>
          <SubmitField value='Unlock' size='large' loading={loadingMsg}/>
        </AutoForm>
      </Col>

    </Row>
  )
}
export default UnlockScreen
