import React, { useState } from 'react'

import ImportKeystoreForm from './walletImportKeystoreForm'
import ImportMnemonicForm from './walletImportMnemonicForm'

const ImportScreen: React.FC = (): JSX.Element => {
  const [isMnemonic, setIsMnemonic] = useState(false)

  return (
    <div className="row">
      <div className="col-md-8 mr-auto ml-auto">
        <h4 className="text-center mb-4">Import existing</h4>

        <ul className="nav nav-tabs d-flex justify-content-center mb-4">
          <li className="nav-item">
            <a className={"nav-link" + (!isMnemonic && (" active") || "")} href="#" onClick={() => setIsMnemonic(false)}>Keystore</a>
          </li>
          <li className="nav-item">
            <a className={"nav-link" + (isMnemonic && (" active") || "")} href="#" onClick={() => setIsMnemonic(true)}>Mnemonic</a>
          </li>
        </ul>

        {isMnemonic ? (
          <ImportMnemonicForm/>
        ):(
          <ImportKeystoreForm/>
        )}

      </div>

    </div>
  )
}
export default ImportScreen

// const ImportKeystoreForm: React.FC = (): JSX.Element => {
//   const [keystoreError, setKeystoreError] = useState('')
//   const [passwordError, setPasswordError] = useState('')
//   const [loadingMsg, setLoadingMsg] = useState('')
//   const [fileBtnText, setFileBtnText] = useState('Select file')

//   const validateKeystore = (keystore: any) => {
//     // return if the keystore is valild
//     try {
//       keystore = JSON.parse(keystore)
//       if (keystore.version && keystore.id) {
//         return keystore
//       } else {
//         setKeystoreError('No valid keystore in file')
//         return false
//       }
//     } catch (objError) {
//       if (objError instanceof SyntaxError) {
//         setKeystoreError('Syntax error in file')
//       } else {
//         setKeystoreError('Error processing file')
//       }
//       return false
//     }
//   }

//   // There is a type: FileList
//   const importWalletFile = (files: FileList, pw: string) => {
//     // files: FileList

//       const reader: FileReader = new FileReader();
//       let keystore
//       reader.onerror = (/* event: React.InputEvent<HTMLFileElement> */) => {
        
//         // const msg = reader.error || ''
//         setKeystoreError("Error reading file. Code: " + reader.error)
//         // throw new Error("File could not be read! Code " + reader.error);
//       };
//       reader.onload = async (/* event */) => {
//         const contents = reader.result;
//         keystore = validateKeystore(contents)
//         if (keystore) { 
//           WALLET.generateNewWallet(pw, null, keystore).then(async () => {
//             await WALLET.unlock(pw)
//             FlowRouter.go("home")
//           }).catch(err => {
//             if (err.message.includes('wrong password')) {
//               setPasswordError('Incorrect password')
//             }
//             setLoadingMsg('')
//           })
//         }
//       };
//       // Execute file read
//       reader.readAsText(files[0])
//   }
//   const handleImportFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
//     const tar = event.currentTarget
//     const files = tar.keystoreFile.files
//     const pw = event.currentTarget.password.value

//     if (files.length === 0) {
//       setKeystoreError("Please select a file") 
//     } else if (pw.length === 0) {
//       setPasswordError("Password required") 
//       // Only handle form if no errors
//     } else if (!keystoreError && !passwordError) {
//         setLoadingMsg("Processing file")
//         // Delay to allow for UI render DOM update before CPU takes over keystore processing
//         setTimeout(() => {
//           try {
//             importWalletFile(files, pw)
//           } catch (err) {
//             console.log(err)
//           }
//         }, 200);
//     }


//   }
//   const handleFileInputChange = (event: React.FormEvent<HTMLInputElement>) => {
//     console.log(event)
//     const tar = event.currentTarget
//     // we change the button text
//     if (tar && tar.files && tar.files.length > 0) {
//       setFileBtnText(tar.files[0].name)
//       validateKeystore(tar.files[0])
//     }
//   }
//   return (
//         <form id="upload-keystore-form" className="form" onSubmit={handleImportFormSubmit}>
//           <fieldset {...(loadingMsg ? {disabled:true} : {})}>

//             <div className="form-row">
//               <div className="form-group col-md-12">
//                 <button id="upload-file-button" type="button" className="form-control btn btn-primary mb-3" data-event="triggerFileInput">
//                   <div className="button-content text-truncate">{fileBtnText}</div>
//                 </button>
//                 <small id="fileHelp" className="form-text text-warning">{keystoreError}</small>
//               </div>

//               <input id="upload-file-input" type="file" className="d-none" name="keystoreFile" onChange={handleFileInputChange}/>

//               <div className="form-group col-md-12">
//                 <label htmlFor="inputPassword">Encryption Password</label>
//                 <input type="password" className="form-control mb-3" name="password" id="inputPassword" aria-describedby="passwordHelp" placeholder="password"/>
//                 <small id="passwordHelp" className="form-text text-warning">{passwordError}</small>
//               </div>

//               <div className="form-group col-md-12">
//                 <button type="submit" className="form-control btn btn-dark btn-brand-border">
//                   {!loadingMsg ? (
//                     <span>Import</span>
//                   ) : (
//                     <span>
//                       <div className="spinner-border spinner-border-sm" role="status">
//                         <span className="sr-only">Loading...</span>
//                       </div>
//                       <span>{loadingMsg}</span>
//                     </span>
//                   )}
//                 </button>

//               </div>

//             </div>

//           </fieldset>
//         </form>
//   )
// }
