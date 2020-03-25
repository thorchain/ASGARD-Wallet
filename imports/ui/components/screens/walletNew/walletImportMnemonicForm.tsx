import React, { useState, useEffect, useRef } from 'react'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { WALLET } from '/imports/startup/client/init'
import { ImportMnemonicFormSchema, ImportMnemonicFormBridge } from '/imports/lib/schemas/importWalletFormSchemas'

import { AutoForm, AutoField } from 'uniforms-antd'
import { SubmitFieldBranded as SubmitField, ErrorField } from '/imports/uniforms-antd-custom/'

const ImportMnemonicForm: React.FC<{activetab?:boolean}> = ({activetab}): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  let formRef:any = useRef(null) // TODO: add autoform type
  useEffect(() => {
    if (!activetab) { formRef.reset() }
  },[activetab])

  const importMnemonicWallet = (mnemonic: string, password: string) => {
    WALLET.generateNewWallet(password, mnemonic).then(async () => {
      await WALLET.unlock(password)
      FlowRouter.go("home")
    }).catch(e => { throw Error(e)}) // TODO: Display some error
  }

  const handleImportFormSubmit = (model:{password:string,repeatPassword:string,mnemonic:string}) => {
    setLoadingMsg("Generating wallet")
    // Delay to allow for UI render DOM update before CPU takes over keystore processing
    setTimeout(() => {
      try {
        importMnemonicWallet(model.mnemonic, model.password)
      } catch (err) {
        setLoadingMsg('')
        console.log(err)
      }
    }, 200);
  }
  return (
    <AutoForm
      ref={(ref:any) => (formRef = ref)}
      model={ImportMnemonicFormSchema.clean({})}
      schema={ImportMnemonicFormBridge}
      onSubmit={handleImportFormSubmit}
    >
      <AutoField name="mnemonic" size="large"/>
      <ErrorField name="mnemonic"/>
      <AutoField name="password" type="password" size="large"/>
      <ErrorField name="password"/>
      <AutoField name="repeatPassword" type="password" size="large"/>
      <ErrorField name="repeatPassword"/>
      <SubmitField value={loadingMsg || 'Import'} size="large" loading={loadingMsg}/>
    </AutoForm>
  )
}
export default ImportMnemonicForm