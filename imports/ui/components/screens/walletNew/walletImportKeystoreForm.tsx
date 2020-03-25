import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { WALLET } from '/imports/startup/client/init'
import { ImportKeystoreFormSchema, ImportKeystoreFormBridge } from '/imports/lib/schemas/importWalletFormSchemas'

import { Button, Upload, Row } from 'antd'
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface'
import { AutoForm, AutoField } from 'uniforms-antd'
import { SubmitFieldBranded as SubmitField, ErrorField } from '/imports/uniforms-antd-custom/'
import { delay } from '/imports/lib/helpers/asyncHelper'

const ImportKeystoreForm: React.FC<{activetab?:boolean}> = ({activetab}): JSX.Element => {
  const [keystoreError, setKeystoreError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  const [fileBtnText, setFileBtnText] = useState<string>('Select file')
  const [file, setFile] = useState<UploadFile | null>()
  const [keystore, setKeystore] = useState<any>()
  let formRef:any = useRef(null) // TODO: add autoform type

  useEffect(() => {
    if (!activetab) { 
      formRef.current.reset()
      setFile(null)
      setFileBtnText('Select file')
      setPasswordError('')
      setKeystoreError('')
      setKeystore(null)
    }
  },[activetab])

  function validateKeystore (file: string | ArrayBuffer | null) {
    try {
      const key = JSON.parse(file as string)
      if (key.version && key.id && key.crypto.cipher === 'aes-256-ctr') {
        setKeystore(key)
        return key
      } else {
        setKeystoreError('Not a valid keystore')
        return false
      }
    } catch (objError) {
      console.log(objError);
      if (objError instanceof SyntaxError) {
        setKeystoreError('Error in file format')
      } else {
        setKeystoreError('Error processing file')
      }
      return false
    }
  }

  const handleImportFormSubmit = useCallback(async (model:{password:string}) => {
    if (!keystore) {
      setKeystoreError('Keystore file required')
    } else {
      setLoadingMsg("Processing file")
      await delay(200)
      WALLET.generateNewWallet(model.password, null, keystore).then(async () => {
        await WALLET.unlock(model.password)
        FlowRouter.go("home")
      }).catch(err => {
        if (err.message.includes('wrong password')) {
          setPasswordError('Incorrect password')
        }
        setLoadingMsg('')
      })
    }
  },[keystore])

  const handleInputFileChange = useCallback((info:UploadChangeParam) => {
    const file = info.file
    if (file && file.status === 'done') {
      setFile(file);
      setFileBtnText(file.name)
      setKeystoreError('')
      const reader = new FileReader()
      const onLoadHandler = () => {
        try {
          validateKeystore(reader.result)
        } catch {
          setKeystoreError('Not a valid json file')
        }
      };
      const onErrorHandler = () => {
        setKeystoreError("Error reading file. Code: " + reader.error)
      }
      reader.addEventListener('load', onLoadHandler)
      reader.addEventListener('error', onErrorHandler)
      reader.readAsText(file.originFileObj);
      return () => {
        reader.removeEventListener('load', onLoadHandler)
      }
    }
    
  },[])
  const handleFormChange = useCallback((field:string) => {
    // Handle rejected password from keystore after ascyn catch from Wallet client
    if (passwordError && field === 'password') {
      setPasswordError('')
      formRef.current.validate().then().catch(e => e)
    }
  },[passwordError])
  const passwordFieldProps = useMemo(() => {
    const p:{name:string,type:string,size:string,error?:string} = {
      name: 'password',
      type: 'password',
      size: 'large',
    }
    if (passwordError) p.error = passwordError
    return p
  },[passwordError])
  const submitProps = useMemo(() => {
    const p:{size:string,value:string,loading:string,disabled:boolean} = {
      size: 'large',
      value: loadingMsg || 'Import',
      loading: loadingMsg,
      disabled: !!(loadingMsg || passwordError || keystoreError)
    }
    return p
  },[loadingMsg, passwordError, keystoreError])
  const passwordErrorProps = useMemo(() => {
    const p:{name:string,error?:boolean,errorMessage?:string} = {name:'password'} 
    if (passwordError) { p.error = true; p.errorMessage = passwordError }
    return p
  },[passwordError])
  return (
    <AutoForm
      model={ImportKeystoreFormSchema.clean({})}
      schema={ImportKeystoreFormBridge}
      onSubmit={handleImportFormSubmit}
      onChange={handleFormChange}
      ref={formRef}
    >
      <Row className="ant-form-item" style={{margin:"12px 0"}}>
        <Upload multiple={false} showUploadList={false} onChange={handleInputFileChange}>
          <Button type="primary" size="large">{fileBtnText}</Button>
        </Upload>
      </Row>
      <ErrorField name="keystore" errorMessage={keystoreError} error={keystoreError}/>
      <AutoField {...passwordFieldProps}/>
      <ErrorField {...passwordErrorProps}/>
      <SubmitField {...submitProps}/>
    </AutoForm>
  )
}

export default ImportKeystoreForm