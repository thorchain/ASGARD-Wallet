import React, { useState, useRef, useEffect } from 'react'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { WALLET } from '/imports/startup/client/init'
import { ImportKeystoreFormSchema, ImportKeystoreFormBridge } from '/imports/lib/schemas/importWalletFormSchemas'

import { Button, Upload, Row } from 'antd'
import { AutoForm, AutoField } from 'uniforms-antd'
import { SubmitFieldBranded as SubmitField, ErrorField } from '/imports/uniforms-antd-custom/'

const ImportKeystoreForm: React.FC<{activetab?:boolean}> = ({activetab}): JSX.Element => {
  const [keystoreError, setKeystoreError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  const [fileBtnText, setFileBtnText] = useState<string>('Select file')
  const [file, setFile] = useState<any>(null)
  let formRef:any = useRef(null) // TODO: add autoform type

  useEffect(() => {
    if (!activetab) { 
      formRef.reset()
      setFile(null)
      setFileBtnText('Select file')
    }
  },[activetab])

  function validateKeystore (file: any) {
    try {
      const keystore = JSON.parse(file)
      if (keystore.version && keystore.id && keystore.crypto.cipher === 'aes-256-ctr') {
        return keystore
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

  const handleImportFormSubmit = (model:{password:string}) => {
    if (!file) {
      setKeystoreError('Keystore file required')
    } else {
      setLoadingMsg("Processing file")
      setTimeout(async () => {
        try {
          const reader: FileReader = new FileReader();
          let keystore
          reader.onerror = () => {
            console.error(reader.error)
            setKeystoreError("Error reading file. Code: " + reader.error)
          };
          reader.onload = async () => {
            const contents = reader.result;
            keystore = validateKeystore(contents)
            if (keystore) { 
              WALLET.generateNewWallet(model.password, null, keystore).then(async () => {
                await WALLET.unlock(model.password)
                FlowRouter.go("home")
              }).catch(err => {
                if (err.message.includes('wrong password')) {
                  setPasswordError('Incorrect password')
                }
                setLoadingMsg('')
              })
            } else {
              throw Error('invalid keystore')
            }
          };
          // Execute file read
          reader.readAsText(file.originFileObj)

        } catch (err) {
          console.log(err)
          setLoadingMsg('')
        }
      }, 200);
    }
  }

  const handleInputFileChange = (info:any) => {
    const file = info.file
    setFile(file);
    
    if (file && file.status === 'done') {
      setFileBtnText(file.name)
      setKeystoreError('')
      const reader = new FileReader();
      reader.onload = e => {
        validateKeystore(e.target?.result)
      };
      reader.onerror = () => {
        console.error(reader.error)
        setKeystoreError("Error reading file. Code: " + reader.error)
      }
      reader.readAsText(file.originFileObj);
    }
    
  }
  return (
    <AutoForm
      id='keystore-upload-form'
      model={ImportKeystoreFormSchema.clean({})}
      schema={ImportKeystoreFormBridge}
      onSubmit={handleImportFormSubmit}
      ref={(ref:any) => (formRef = ref)}
    >
      <Row className="ant-form-item" style={{margin:"12px 0"}}>
        <Upload multiple={false} showUploadList={false} onChange={handleInputFileChange}>
          <Button type="primary" size="large">{fileBtnText}</Button>
        </Upload>
      </Row>
      <ErrorField name="keystore" errorMessage={keystoreError} error={keystoreError}/>
      <AutoField name="password" type="password" size="large"/>
      <ErrorField name="password"/>
      <SubmitField value={loadingMsg || 'Import'} size="large" loading={loadingMsg} disabled={(loadingMsg || passwordError || keystoreError)}/>
    </AutoForm>
  )
}

export default ImportKeystoreForm