import React from 'react';
// import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout, BareLayout, BareLayoutBranded} from '../imports/ui/reactTest/reactFrame';
import StartScreen from '../imports/ui/components/main_modules/walletStart'

import {mount, withOptions} from 'react-mounter';
const mounter = withOptions({
    rootId: 'app',
    rootProps: {'className': 'some-class-name'}
}, mount);

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
			} else if (isVault() && isUnlocked()) {
				// Redirect back to where came from
				// SECURITY: assumes 'unlocked' is non-persistant
				// as is default on instantiation of wallet controller class
				FlowRouter.go(context.oldRoute.name)
			}
		}
	}],
});

appRoutes.route('/reactTest', {
	name: 'reactTest',
	action() {
    // ReactLayout.render(MainLayout, {
    //   content: "test content"
		// });
		mounter(BareLayout, {
      content: <StartScreen/>,
    });
  }
})

appRoutes.route('/', {
	name: 'walletStart',
	action: function (params, queryParams) {
		BlazeLayout.render(bareFrame, {content:'walletStart'});
	}
});

appRoutes.route('/create/:type?', {
	name: 'walletCreate',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletCreate'});
	},
	back: {
		route: 'walletStart',
	}
});
appRoutes.route('/mnemonic-confirm', {
	name: 'walletMnemonicConfirm',
	// restric/direct access to this route
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletNewMnemonicConfirm'});
	}
})

appRoutes.route('/import', {
	name: 'walletImport',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletImport'});
	},
	back: {
		route: 'walletStart',
	}
});

appRoutes.route('/unlock', {
	name: 'walletUnlock',
	action: function (params, queryParams) {
		BlazeLayout.render(bareNavFrame, {content:'walletUnlock'});
	}
})

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

walletRoutes.route('/home', {
	name: 'home',
	action: function (params, queryParams) {
		FlowRouter.go('walletAssets');
	}
});

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

