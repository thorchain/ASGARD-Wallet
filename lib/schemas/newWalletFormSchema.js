
Schemas.formNewWallet = new SimpleSchema({
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

validateMnemonic = function () {
  // this.value
  if (!BNB.sdk.crypto.validateMnemonic(this.value)) { return "invalidMnemonic"}
  
}
Schemas.formNewWallet = new SimpleSchema({
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
