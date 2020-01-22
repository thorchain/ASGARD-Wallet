if (Meteor.isClient) {
	Template.walletUnlock.onCreated(function() {
		const self = this
		self.unlockWallet = async (pw) => {
			const vault = localStorage.getItem('binance');
			const keystore = JSON.parse(vault)
			const account = await BNB.bnbClient.recoverAccountFromKeystore(keystore, pw)
			account.keystore = keystore
			await self.setUserData(account)
		}
		self.setUserData = async (account) => {
      await BNB.initializeClient(account.privateKey)
			const doc = UserAccount.findOne();
			const select = doc && doc._id ? {_id: doc._id} : {};
      await BNB.getBalances().then(e => {
        account.assets = e.map(function(elem) {
          elem.shortSymbol = elem.symbol.split("-")[0].substr(0,4)
          return elem
        })
				UserAccount.remove({})
        UserAccount.update(select, account, {upsert: true})
      })
			await BNB.bnbClient.getTransactions(account.address).then(e => {
        UserTransactions.remove({})
				UserTransactions.batchInsert(e.result.tx)
			})

		}
	})
	Template.walletUnlock.events({
    "submit #wallet-unlock-form": async function (event, self) {
      event.preventDefault();
      const tar = event.currentTarget;
			const pw = tar && tar.password.value;
			try {
				await self.unlockWallet(pw)
				FlowRouter.go("home")
			} catch (err) {
				console.error(err)
			}
    },
	})
}