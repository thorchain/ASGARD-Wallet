if (Meteor.isClient) {
	Template.walletUnlock.onCreated(function() {
		const self = this
		self.isLoading = new ReactiveVar(false)
		self.loadingMsg = new ReactiveVar("")
		self.unlockWallet = async (pw) => {
			self.isLoading.set(true)
			const vault = localStorage.getItem('binance');
			const keystore = JSON.parse(vault)
			const account = await BNB.bnbClient.recoverAccountFromKeystore(keystore, pw)
			account.keystore = keystore
			await self.setUserData(account)

		}
		self.setUserData = async (account) => {
			self.loadingMsg.set("getting data")
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
			// Setup events subscription
			const conn = new WebSocket("wss://testnet-dex.binance.org/api/ws");
			conn.onopen = function (evt) {
				conn.send(JSON.stringify({ method: "subscribe", topic: "accounts", address: account.address}));
			}
			conn.onmessage = function (msg) {
        console.log("got websocket msg")
				const data = JSON.parse(msg.data)
				const balances = data.data.B
        assets = balances.map(function(elem) {
					// These mappings for account are different than http api...
					// free = f
					// frozen = r
					// locked = l
					// symbol = a
					// shortSymbol = nothing....
					//
					const asset = {
						free: elem.f,
						frozen: elem.r,
						locked: elem.l,
						symbol: elem.a
					}
          asset.shortSymbol = asset.symbol.split("-")[0].substr(0,4)
          return asset
        })
				const doc = UserAccount.findOne();
				const select = doc && doc._id ? {_id: doc._id} : {};
				UserAccount.update(select, {$set: {assets: assets}}, {upsert: true})
				// Probably we want to update transactions?
			}

		}
	})

	Template.walletUnlock.helpers({
		isLoading () { return Template.instance().isLoading.get() },
		loadingMsg () { return Template.instance().loadingMsg.get() }
	})

	Template.walletUnlock.events({
    "submit #wallet-unlock-form": async function (event, self) {
      event.preventDefault();
			self.isLoading.set(true)
			self.loadingMsg.set("attempting to decrypt")
      const tar = event.currentTarget;
			const pw = tar && tar.password.value;
			// just add a delay?
			setTimeout(async () => {
				try {
					await self.unlockWallet(pw)
					FlowRouter.go("home")
				} catch (err) {
					self.isLoading.set(false)
					console.error(err)
				}
			}, 500);
			
    },
	})
}