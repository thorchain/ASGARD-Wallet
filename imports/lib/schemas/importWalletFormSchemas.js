import SimpleSchema from 'simpl-schema'
import { Tracker } from 'meteor/tracker'
import { BNB } from '/imports/api/wallet'
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { HiddenField } from 'uniforms-antd';


validateMnemonic = function () {
  // TODO: This `trim()` is a workaround for missing cleaning..?
  if (!BNB.sdk.crypto.validateMnemonic(this.value.trim())) { return "invalidMnemonic"}
}

const File = new SimpleSchema({
  lastModified: Number,
  lastModifiedDate: Date,
  name: String,
  size: Number, // not validating properly
  type: String, // not 'type' though....
  webkitRelativePath: String,
})
export const ImportKeystoreFormSchema = new SimpleSchema({
  password: {
    type: String,
    // min: 8
  },
  // NOTE: This will not properly clean the file object
  // Uncaught TypeError: Cannot assign to read only property 'size' of object '#<File>'
  // keystore: {
  //   type: Object, // Try to switch to type 'File' above
  //   blackbox: true,
  //   optional: true // override when cleaning/validating
  //   // TODO: Get the validation working here ?
  // }
  keystore: {
    type: Object, // Try to switch to type 'File' above
    blackbox: true,
    optional: true, // override when cleaning/validating
    // TODO: Get the validation working here ?
    custom() {
    },
    uniforms: HiddenField
  }
},{ tracker: Tracker, })

export const ImportKeystoreFormBridge = new SimpleSchema2Bridge(ImportKeystoreFormSchema);

export const ImportMnemonicFormSchema = new SimpleSchema({
  mnemonic: {
    type: String,
    label: "Phrase",
    custom: validateMnemonic
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
      if (this.value !== this.field('password').value) { return "passwordMismatch"; }
    },
  },
},{ tracker: Tracker });

export const ImportMnemonicFormBridge = new SimpleSchema2Bridge(ImportMnemonicFormSchema);

