if (Meteor.isClient) {
	Template.walletUnlock.onCreated(function() {
		console.log("unlock wallet...")
		const self = this
		self.unlockWallet = (pw) => {
			const vault = localStorage.getItem('binance');
			const keystore = JSON.parse(vault)
			const account = BNB.bnbClient.recoverAccountFromKeystore(keystore, pw)
			const doc = UserAccount.findOne();
			const select = doc && doc._id ? {_id: doc._id} : {};
			return UserAccount.update(select, account, {upsert: true})
		}
	})
	Template.walletUnlock.events({
    "submit #wallet-unlock-form": async function (event, self) {
      event.preventDefault();
      const tar = event.currentTarget;
			const pw = tar && tar.password.value;
			console.log("unlocking wallet...");
			// self.unlockWallet(pw);
			try {
				self.unlockWallet(pw)
				FlowRouter.go("walletAccounts")
			} catch (err) {
				console.error(err)
			}
    },
	})
}