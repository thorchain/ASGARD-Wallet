if (Meteor.isClient) {
	Template.walletUnlock.onCreated(function() {
		const self = this
		// self.isLoading = new ReactiveVar(false)
		self.loadingMsg = new ReactiveVar(null)
		self.formErrors = new ReactiveDict()

		self.unlockWallet = async (pw) => {
			try {
				// shoud should loading msgs here
				await WALLET.unlockAndSync(pw)
				// await WALLET.syncUserData()
			} catch (error) {
				self.formErrors.set('password',error.message)
				throw new Error(error.message)
			}
		}
	})

	Template.walletUnlock.helpers({
		// isLoading () { return Template.instance().isLoading.get() },
		loadingMsg () { return Template.instance().loadingMsg.get() },
		pwError () { return Template.instance().formErrors.get('password')}
	})

	Template.walletUnlock.events({
		"keyup #wallet-unlock-form input": function (event, self) {
			self.formErrors.set('password','')
		},
    "submit #wallet-unlock-form": async function (event, self) {
      event.preventDefault();
      const tar = event.currentTarget;
			const pw = tar && tar.password.value;
			
			if (pw.length === 0) { 
				self.formErrors.set('password', 'Password required')
			} else {
				// self.isLoading.set(true)
				self.loadingMsg.set("unlocking")
				try {
					await self.unlockWallet(pw)
					FlowRouter.go("home")
				} catch (err) {
					// self.isLoading.set(false)
					self.loadingMsg.set(null)
					console.error(err.message)
				}
			}
			
    },
	})
}