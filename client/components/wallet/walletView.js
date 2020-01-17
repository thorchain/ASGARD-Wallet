import WalletController from "./WalletController";

if (Meteor.isClient) {
  const State = new Mongo.Collection(null);
  Template.walletView.onCreated(function () {
    const self = this;
    keyringController.on('update', (e) => {
      self.setState();
    })
    keyringController.on('newAccount', (e) => {
      self.setState();
    })
    self.setState = async function () {
      const keyringState = await keyringController.memStore.getState()
      const doc = State.findOne();
      const id = doc && doc._id ? {_id: doc._id} : {};
      State.update(id, keyringState, {upsert: true});
    }
    self.setState()
    self.autorun(function () {
    });
  });

  Template.walletView.helpers({
    walletState: function () {
      const doc = State.findOne();
      return doc;
    },
    keyrings: function () {
      const doc = State.findOne();
      const keyrings = doc.keyrings.map(ring => {
        if (ring.type === "cosmos") {
          ring.accounts = ring.accounts.map(e =>{
            const e2 = e.substr(2)
            return e2
          })
        }
        return ring;
      })
      return doc.keyrings;
    },
    unlocked: function () {
      const doc = State.findOne();
      return doc && doc._id ? doc.isUnlocked : false;
    }
  });

  Template.walletView.events({
    "submit #wallet-unlock-form": async function (event, self) {
      event.preventDefault();
      const tar = event.currentTarget;
      const pw = tar && tar.password.value;
      keyringController.submitPassword(pw); 
    },
    "click [data-event='walletLock']": async function (event, self) {
      event.preventDefault();
      keyringController.setLocked();
    },
    "click [data-event='addNewKeyring']": async function (event, self) {
      event.preventDefault();
      const keyringType = event.currentTarget.dataset.param
      const newring = await keyringController.addNewKeyring(keyringType);
      const newVault = await keyringController.store.getState().vault;
      window.localStorage.setItem("vault", newVault);
    },
    "click [data-event='addNewAccount']": async function (event, self) {
      event.preventDefault();
      const keyringType = event.currentTarget.dataset.param
      const keyring = keyringController.getKeyringsByType(keyringType)[0]
      await keyringController.addNewAccount(keyring);
      
      const newVault = await keyringController.store.getState().vault;
      window.localStorage.setItem("vault", newVault);

    }
  });
}