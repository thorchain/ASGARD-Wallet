import SimpleSchema from 'simpl-schema'
import { Tracker } from 'meteor/tracker'
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { HiddenField } from 'uniforms-antd';

import { UserAccount } from '/imports/api/collections/client_collections'
var bcrypt = require('bcryptjs');

export const WalletUnlockFormSchema = new SimpleSchema({
  password: {
    type: String,
    label: 'Password',
    custom () {
      if (!bcrypt.compareSync(this.value, this.field('pwHash').value)) {
        return "passwordError";
      }
    }
  },
  pwHash: {
    type: String,
    label: "pwHash",
    autoValue() {
      const res = UserAccount.findOne()
      return res?.pwHash
    },
    uniforms: HiddenField
  }
},{tracker: Tracker})

export const WalletUnlockFormBridge = new SimpleSchema2Bridge(WalletUnlockFormSchema);