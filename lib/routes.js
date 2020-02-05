const mainFrame = 'mainAppFrame';
const bareFrame = 'bareAppFrame';
const bareNavFrame = 'bareAppNavFrame';
const appRoutes = FlowRouter.group({
	name: 'mainAppRoutes',
	triggersEnter: [function (context, redirect) {
		// Temporary single exception for dev purposes
		if (context.route.name !== "settings") {
			if (!isVault()) {
				// FlowRouter.go('walletStart', context.params, context.queryParams)
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
		// FlowRouter.go('walletAssets')
		if (isVault()) {
			FlowRouter.go('walletAssets');
		} else {
			FlowRouter.go('walletStart');
		}
	}
});

appRoutes.route('/start', {
	name: 'walletStart',
	action: function (params, queryParams) {
		BlazeLayout.render(bareFrame, {content:'walletStart'});
	}
});

appRoutes.route('/create', {
	name: 'walletCreate',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletCreate'});
	},
	back: {
		route: 'walletStart',
	}
});

appRoutes.route('/import', {
	name: 'walletImport',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletImport'});
	},
	back: {
		route: 'walletStart',
	}
});

appRoutes.route('/settings', {
	name: 'settings',
	action: function (params, queryParams) {
		BlazeLayout.render(bareNavFrame, {content:'settings'});
	},
	back: {
		route: 'home',
	}
});

const walletRoutes = FlowRouter.group({
	name: 'walletRoutes',
	prefix: '/wallet',
	triggersEnter: [function (context, redirect){
		
		if (!isVault() && !isUnlocked()) {
			FlowRouter.go('walletStart', context.params, context.queryparams)
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
		BlazeLayout.render(bareNavFrame, {content:'walletUnlock'});
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
	},
	back: {
		route: 'walletAssets',
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
	},
	back: {
		route: 'walletAssets',
	}
})
walletRoutes.route('/send/:asset?', {
	name: "walletSend",
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletSend'});
	},
	back: {
		route: 'walletAssets',
	}
})
walletRoutes.route('/receive', {
	name: "walletReceive",
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletReceive'});
	},
	back: {
		route: 'walletAssets',
	}
})
walletRoutes.route('/transactionsList', {
	name: "walletTransactionsList",
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletTransactionsList'});
	},
	back: {
		route: 'walletAssets',
	}
});

const isVault = function () {
	const vault = window.localStorage.getItem('binance');
	return vault ? true : false;
}
const isUnlocked = function () {
	// this needs to be fixed.
	// Currently this fails (as would be needed) but only because
	// there is a delay on loading the data... this could changein the future
	// remove ambiguity as to 
	// const account = UserAccount.findOne() // TODO: we can get a better way

	// support case for first login also
	// return (account && account.isUnlocked)
	return WALLET.getIsUnlocked()
	// return (account && account.isUnlocked)
}