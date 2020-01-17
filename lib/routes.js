const mainFrame = 'mainAppFrame';
const appRoutes = FlowRouter.group({
	name: 'mainAppRoutes',
	triggersEnter: [function (context, redirect) {
		if (!isVault()) {
			// FlowRouter.go('walletGenerate');
		}
	}],
});

appRoutes.route('/', {
	name: 'home',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'home'});
	}
});

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
			// FlowRouter.go('walletGenerate');
		}
	}],
});

walletRoutes.route('/generate', {
	name: 'walletGenerate',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletGenerate'});
	}
})
walletRoutes.route('/import', {
	name: 'walletImport',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletImport'});
	}
})

walletRoutes.route('/view', {
	name: 'walletView',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletView'});
	}
})
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
walletRoutes.route('/send', {
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

const isVault = function () {
	const vault = window.localStorage.getItem('vault');
	return typeof vault === "string" ? true : false;
}