import React, { useState } from 'react'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { WALLET } from "/imports/startup/client/init"
import { WalletUnlockFormSchema, WalletUnlockFormBridge } from '/imports/lib/schemas/walletUnlockFormSchema'

import { Row, Col } from 'antd'
import { AutoForm, AutoField, SubmitField } from 'uniforms-antd'
import { ErrorField } from '/imports/uniforms-antd-custom/'

const UnlockScreen: React.FC = (): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  const handleUnlockFormSubmit = (model:{password:string,pwHash:string}) => {
    // SECURITY: This only gets called from valid form
    setLoadingMsg('Unlocking')
    WALLET.unlockAndSync(model.password)
    .then(() => FlowRouter.go('walletAssets'))
    .catch(e => {
      setLoadingMsg('')
      throw Error(e)
    })
      
  }
  return (
    <Row>

      <Col md={{span:16,offset:4}} lg={{span:14,offset:5}} xl={{span:12,offset:0}}>
        <img className="mx-auto d-block w-25 mb-5" src="/img/Asgard-Tri-Gradient.svg"/>
      </Col>

      <Col md={{span:16,offset:4}} lg={{span:14,offset:5}} xl={{span:12,offset:6}}>
        <AutoForm
          model={WalletUnlockFormSchema.clean({})}
          schema={WalletUnlockFormBridge}
          onSubmit={handleUnlockFormSubmit}
        >
          <AutoField name="password" type="password" size='large' label={false}/>
          <ErrorField name='password'/>
          <SubmitField value='Unlock' size='large' loading={loadingMsg}/>
        </AutoForm>
      </Col>

    </Row>
  )
}
export default UnlockScreen
