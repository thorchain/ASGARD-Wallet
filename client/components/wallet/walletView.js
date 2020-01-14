import WalletController from "./wallet";

if (Meteor.isClient) {
  const State = new Mongo.Collection(null);
  Template.walletView.onCreated(function () {
    var self = this;
    console.log("looking at wallet");
    console.log(keyringController.memStore.getState());
    self.setState = function () {
      const keyringState = keyringController.memStore.getState()
      const doc = State.findOne();
      const id = doc && doc._id ? {_id: doc._id} : {};
      State.update(id, keyringState, {upsert: true});
    }
    self.unlock = async function (pw) {
      console.log("unlocking keyringController/wallet");
      
      // await Wallet.unlock(pw);
      await keyringController.submitPassword(pw);
      console.log("did we unlock?");
      
      self.setState();
    }
    self.lock = async function () {
      await keyringController.setLocked();
      self.setState();
    }
    self.autorun(function () {
      console.log("can we reactively switch the view?");
      self.setState();
    });
  });

  Template.walletView.helpers({
    walletState: function () {
      const doc = State.findOne();
      return doc;
    },
    keyrings: function () {
      const doc = State.findOne();
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
      self.unlock(pw);
    },
    "click [data-event='walletLock']": function (event, self) {
      event.preventDefault();
      self.lock();
    },
  });
}