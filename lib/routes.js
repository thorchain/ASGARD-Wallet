const mainFrame = 'mainAppFrame';
const appRoutes = FlowRouter.group({
	name: 'mainAppRoutes',
	triggersEnter: [function (context, redirect) {
		// Temporary single exception for dev purposes
		if (context.route.name !== "settings") {
			if (!isVault()) {
				FlowRouter.go('walletCreate', context.params, context.queryParams)
			} else if (!isUnlocked()) {
				FlowRouter.go('walletUnlock')
			}
		}
	}],
});

appRoutes.route('/', {
	name: 'home',
	action: function (params, queryParams) {
		// BlazeLayout.render(mainFrame, {content:'home'});
		FlowRouter.go('walletAssets')
	}
});

appRoutes.route('/create/:method?', {
	name: 'walletCreate',
	action: function (params, queryParams) {
		if (isVault()) {
			FlowRouter.go('walletAccounts')
		} else {
			BlazeLayout.render(mainFrame, {content:'walletCreate'});
		}
	}
})

appRoutes.route('/settings', {
	name: 'settings',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'settings'});
	}
});

const walletRoutes = FlowRouter.group({
	name: 'walletRoutes',
	prefix: '/wallet',
	triggersEnter: [function (context, redirect){
		
		if (!isVault()) {
			FlowRouter.go('walletCreate', context.params, context.queryparams)
		} else if (!isUnlocked()) {
			FlowRouter.go('walletUnlock')
		}
	}],
});

// walletRoutes.route('/import', {
// 	name: 'walletImport',
// 	action: function (params, queryParams) {
// 		BlazeLayout.render(mainFrame, {content:'walletImport'});
// 	}
// })
walletRoutes.route('/unlock', {
	name: 'walletUnlock',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletUnlock'});
	}
})

// walletRoutes.route('/view', {
// 	name: 'walletView',
// 	action: function (params, queryParams) {
// 		BlazeLayout.render(mainFrame, {content:'walletView'});
// 	}
// })
walletRoutes.route('/accounts', {
	name: 'walletAccounts',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletAccounts'});
	}
})
walletRoutes.route('/assets', {
	name: 'walletAssets',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletAssets'});
	}
})
walletRoutes.route('/assetDetails/:symbol', {
	name: 'walletAssetDetails',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletAssetDetails'});
	}
})
walletRoutes.route('/send/:asset?', {
	name: "walletSend",
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletSend'});
	}
})
walletRoutes.route('/receive', {
	name: "walletReceive",
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletReceive'});
	}
})
walletRoutes.route('/transactionsList', {
	name: "walletTransactionsList",
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletTransactionsList'});
	}
});

const isVault = function () {
	const vault = window.localStorage.getItem('binance');
	return vault ? true : false;
}
const isUnlocked = function () {
	const account = UserAccount.findOne() // TODO: we can get a better way
	return (account && account.privateKey)
}