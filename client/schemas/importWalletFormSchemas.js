import SimpleSchema from 'simpl-schema'
import { BNB } from '/imports/api/wallet'
Schemas = (typeof Schemas === "undefined") ? {} : Schemas;

validateMnemonic = function () {
  if (!BNB.sdk.crypto.validateMnemonic(this.value)) { return "invalidMnemonic"}
}


Schemas.formImportWalletMnemonic = new SimpleSchema({
  mnemonic: {
    type: String,
    label: "Phrase",
    custom: validateMnemonic
    // optional: true
    // min: 8,
  },
  password: {
    type: String,
    label: "Password",
    // min: 8,
  },
  repeatPassword: {
    type: String,
    label: "Password Confirmation",
    // min: 8,
    custom() {
      if (this.value !== this.field('password').value) {
        return "passwordMismatch";
      }
    },
  },
},{ tracker: Tracker });


// Below being done in component
// The type "File" cannot be passed throught the schema by default
// TODO: Add custom schema field type "File"
// ie: SimpleSchema.File
// addValidationErrors(errors)
validateKeystoreFile = function () {
  // how to pass type file?

  const reader = new FileReader();
  let keystore
  reader.onerror = (event) => {
    self.formErrors.set("keystoreFile", event.target.error.code)
    // addValidationErrors(errors)
    throw new Error("File could not be read! Code " + event.target.error.code);
  };
  reader.onload = async (event) => {
    // self.isLoading.set(true)
    // self.loadingMsg.set("generating wallet")
    console.log("executing reading file...");
    var contents = event.target.result;
    keystore = JSON.parse(contents)
    // self.processKeystore(keystore, pw)
    // https://stackoverflow.com/questions/4467044/proper-way-to-catch-exception-from-json-parse
    try {
      keystore = JSON.parse(contents)
      if (keystore.version && keystore.id) {
        self.processKeystore(keystore, pw)
      } else {
        // self.formErrors.set("keystoreFile", "No valid keystore in file")
// this.addValidationErrors(errors)
      }
    } catch (objError) {
      if (objError instanceof SyntaxError) {
        // self.formErrors.set("keystoreFile", "" + objError.name + " while processing file")
// addValidationErrors(errors)
      } else {
        // self.formErrors.set("keystoreFile", objError.message)
// addValidationErrors(errors)
      }
    }
  };
  
  // Execute file read
  return reader.readAsText(file)
}

export default Schemas