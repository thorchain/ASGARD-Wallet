import React, { useState, useRef } from 'react'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { WALLET } from '/imports/startup/client/init'
import { ImportKeystoreFormSchema } from '/imports/lib/schemas/importWalletFormSchemas'

const ImportKeystoreForm: React.FC = (): JSX.Element => {
  const [keystoreError, setKeystoreError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  const [fileBtnText, setFileBtnText] = useState<string>('Select file')
  const fileUploadRef = useRef<HTMLInputElement>(null)

  // TODO: Add keystore types
  // Move to schema validation if possible(?)
  function validateKeystore (file: any) {
    try {
      const keystore = JSON.parse(file)
      if (keystore.version && keystore.id) {
        return keystore
      } else {
        setKeystoreError('No valid keystore in file')
        return false
      }
    } catch (objError) {
      console.log(objError);
      
      if (objError instanceof SyntaxError) {
        setKeystoreError('Syntax error in file')
      } else {
        setKeystoreError('Error processing file')
      }
      return false
    }
  }

  const importWalletFile = (files: FileList, pw: string, validate?: boolean) => {
      const reader: FileReader = new FileReader();
      let keystore
      reader.onerror = () => {
        console.error(reader.error)
        setKeystoreError("Error reading file. Code: " + reader.error)
      };
      reader.onload = async () => {
        const contents = reader.result;
        keystore = validateKeystore(contents)
        if (!validate && keystore) { 
          WALLET.generateNewWallet(pw, null, keystore).then(async () => {
            await WALLET.unlock(pw)
            FlowRouter.go("home")
          }).catch(err => {
            if (err.message.includes('wrong password')) {
              setPasswordError('Incorrect password')
            }
            setLoadingMsg('')
          })
        }
      };
      // Execute file read
      reader.readAsText(files[0])
  }

  const handleImportFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const tar = event.currentTarget
    const files = tar.keystoreFile.files
    const pw = tar.password.value

    // Schema validation will not work with the file, yet...
    const validationContext = ImportKeystoreFormSchema.newContext()
    const obj = validationContext.clean({password:pw})
    validationContext.validate(obj)
    if (files.length === 0) {
      validationContext.addValidationErrors([{ name: 'keystore', type: 'required' }])
    }

    if (!validationContext.isValid()) {
      setPasswordError(validationContext.keyErrorMessage('password'))
      setKeystoreError(validationContext.keyErrorMessage('keystore'))
    } else {
      setLoadingMsg("Processing file")
      // Delay to allow for UI render DOM update before CPU takes over keystore processing
      setTimeout(async () => {
        try {
          importWalletFile(files, obj.password)
        } catch (err) {
          console.log(err)
          setLoadingMsg('')
        }
      }, 200);
    }

  }

  const handleFileInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    const tar = event.currentTarget
    if (tar && tar.files && tar.files.length > 0) {
      setFileBtnText(tar.files[0].name)
      setKeystoreError('')
      importWalletFile(tar.files, '', true) // true will onll validate
    }
  }
  const handlePasswordInputChange = () => {
    setPasswordError('')
  }
  const handleClickFileButton = () => {
    if (fileUploadRef && fileUploadRef.current) {
      fileUploadRef.current.click();
    }
  }
  return (
        <form id="upload-keystore-form" className="form" onSubmit={handleImportFormSubmit}>
          <fieldset {...(loadingMsg ? {disabled:true} : {})}>

            <div className="form-row">
              <div className="form-group col-md-12">
                <button id="upload-file-button" type="button" className="form-control btn btn-primary mb-3" onClick={handleClickFileButton}>
                  <div className="button-content text-truncate">{fileBtnText}</div>
                </button>
                <small id="fileHelp" className="form-text text-warning">{keystoreError}</small>
              </div>

              <input id="upload-file-input" type="file" className="d-none" name="keystoreFile" onChange={handleFileInputChange} ref={fileUploadRef}/>

              <div className="form-group col-md-12">
                <label htmlFor="inputPassword">Encryption Password</label>
                <input type="password" className="form-control mb-3" name="password" id="inputPassword" aria-describedby="passwordHelp" placeholder="password" onChange={handlePasswordInputChange}/>
                <small id="passwordHelp" className="form-text text-warning">{passwordError}</small>
              </div>

              <div className="form-group col-md-12">
                <button type="submit" className="form-control btn btn-dark btn-brand-border">
                  {!loadingMsg ? (
                    <span>Import</span>
                  ) : (
                    <span>
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      <span className="ml-1">{loadingMsg}</span>
                    </span>
                  )}
                </button>

              </div>

            </div>

          </fieldset>
        </form>
  )
}
export default ImportKeystoreForm