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

  