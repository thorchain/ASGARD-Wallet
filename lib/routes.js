const mainFrame = 'mainAppFrame';
const appRoutes = FlowRouter.group({
	name: 'mainAppRoutes',
	triggersEnter: [function (context, redirect) {
		if (!isVault()) {
			FlowRouter.go('walletGenerate');
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
			FlowRouter.go('walletGenerate');
		}
	}],
});

walletRoutes.route('/generate', {
	name: 'walletGenerate',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletGenerate'});
	}
});

walletRoutes.route('/view', {
	name: 'walletView',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletView'});
	}
})

const isVault = function () {
	const vault = window.localStorage.getItem('vault');
	return typeof vault === "string" ? true : false;
}