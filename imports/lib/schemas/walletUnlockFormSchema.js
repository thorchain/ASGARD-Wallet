import SimpleSchema from 'simpl-schema'
import { Tracker } from 'meteor/tracker'
var bcrypt = require('bcryptjs');

const WalletUnlockFormSchema = new SimpleSchema({
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
    // Passed in manual validation, do not send from html form
    type: String,
    label: "pwHash"
  }
},{ tracker: Tracker})

export default WalletUnlockFormSchema