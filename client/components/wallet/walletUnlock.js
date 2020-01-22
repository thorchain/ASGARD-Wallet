if (Meteor.isClient) {
	Template.walletUnlock.onCreated(function() {
		const self = this
		self.unlockWallet = (pw) => {
			const vault = localStorage.getItem('binance');
			const keystore = JSON.parse(vault)
			const account = BNB.bnbClient.recoverAccountFromKeystore(keystore, pw)
			account.keystore = keystore
			self.setUserData(account)
		}
		self.setUserData = async (account) => {
      BNB.setPrivateKey(account.privateKey)
			const doc = UserAccount.findOne();
			const select = doc && doc._id ? {_id: doc._id} : {};
			// This inits the binance client as well
			UserAccount.update(select, account, {upsert: true})
			await BNB.binanceTokens().then(e => {
				TokenData.batchInsert(e.data)
			})
			await BNB.bnbClient.getTransactions(account.address).then(e => {
				UserTransactions.batchInsert(e.result.tx)
			})
		}
	})
	Template.walletUnlock.events({
    "submit #wallet-unlock-form": async function (event, self) {
      event.preventDefault();
      const tar = event.currentTarget;
			const pw = tar && tar.password.value;
			// self.unlockWallet(pw);
			try {
				self.unlockWallet(pw)
				FlowRouter.go("home")
			} catch (err) {
				console.error(err)
			}
    },
	})
}