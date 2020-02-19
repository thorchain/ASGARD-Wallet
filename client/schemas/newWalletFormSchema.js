Schemas = (typeof Schemas === "undefined") ? {} : Schemas;

Schemas.formNewWallet = new SimpleSchema({
  // optional mnemonic generated & submitted by component
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

Schemas.formNewMnemonicWallet = new SimpleSchema({
  // optional mnemonic generated & submitted by component
  phrase: {
    type: String,
    label: "Phrase"
  },
  repeatPhrase: {
    type: String,
    label: "Repeat Phrase",
    custom() {
      const phrase = this.field('phrase').value.trim()
      const repeatPhrase = this.value.trim()
      
      if (phrase.length !== repeatPhrase.length) {
        console.log("error with phrase");
        
        return "incompleteMnemonic"
      }
    }
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
        return "passwordMismatch"
      }
    },
  },
},{ tracker: Tracker });

  