// NOTE: We will transaction this to React when needed
// Replace BlazeLayout.render, with React.render
// https://github.com/danakt/handlebars-to-jsx
// All handlebars templates can be transpile to valid react components
const mainFrame = 'mainAppFrame';
const bareFrame = 'bareAppFrame';
const bareNavFrame = 'bareAppNavFrame';

const isVault = () => {
	return window.localStorage.getItem('binance') ? true : false;
}
const isUnlocked = () => {
	return WALLET.isUnlocked() === true ? true : false;
}

const appRoutes = FlowRouter.group({
	name: 'mainAppRoutes',
	triggersEnter: [function (context, redirect) {
		if (context.route.name !== "settings") {
			if (isVault() && !isUnlocked()) {
				FlowRouter.go('walletUnlock')
			}
		}
	}],
});

appRoutes.route('/', {
	name: 'home',
	action: function (params, queryParams) {
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
			FlowRouter.go('walletStart')
		} else if (isVault() && !isUnlocked()) {
			FlowRouter.go('walletUnlock')
		}
	}],
});

walletRoutes.route('/unlock', {
	name: 'walletUnlock',
	action: function (params, queryParams) {
		BlazeLayout.render(bareNavFrame, {content:'walletUnlock'});
	}
})
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

