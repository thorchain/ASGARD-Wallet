import React from 'react';
import ReactDOM from "react-dom";
// import { Blaze } from 'meteor/blaze'
// import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout, BareLayoutBranded} from '../imports/ui/components/containers/appFrames'
import NavbarSimple from '../imports/ui/components/elements/navbarSimple'
import StartScreen from '../imports/ui/components/screens/walletStart'
import UnlockScreen from '../imports/ui/components/screens/walletUnlock'
import UnlockOptionsScreen from '../imports/ui/components/screens/walletUnlockOptions'

import {mount, withOptions} from 'react-mounter';
const mounter = withOptions({
    rootId: '__react-root',
    rootProps: {'className': 'some-class-name'}
}, mount);

const mainFrame = 'mainAppFrame';
// const bareFrame = 'bareAppFrame';
// const bareNavFrame = 'bareAppNavFrame';

const isVault = () => {
	return window.localStorage.getItem('binance') ? true : false;
}
const isUnlocked = () => {
	return WALLET.isUnlocked() === true ? true : false;
}
const swapRenderer = (newType) => {
	if (newType === 'react') {
		console.info("swapping view layer to react");
		$("#__blaze-root").hide()
		try {
			BlazeLayout.reset()
		} catch (error) {
			// fail silently
		}
		$("#__react-root").show()
	} else if (newType === 'blaze') {
		console.info("swapping view layer to blaze");
		$("#__react-root").hide()
		try {
			const ele = document.getElementById('__react-root')
			ReactDOM.unmountComponentAtNode(ele)
		} catch (error) {
			// fail silently
		}
		$("#__blaze-root").show()
	}

}

const appRoutes = FlowRouter.group({
	name: 'mainAppRoutes',
	triggersEnter: [function (context, redirect) {
		console.log("entering new route");
		console.log(context);
		const newType = context.route.options.renderType
		const oldType = context.oldRoute && context.oldRoute.options && context.oldRoute.options.renderType
		if (newType !== oldType && typeof oldType !== 'undefined') {
			swapRenderer(newType)
		}
		
		if (context.route.name !== "settings" && context.route.name !== "options") {
			if (isVault() && !isUnlocked()) {
				FlowRouter.go('walletUnlock')
			} else if (isVault() && isUnlocked()) {
				// Redirect back to where came from
				// SECURITY: assumes 'unlocked' is non-persistant
				// as is default on instantiation of wallet controller class
				// There should be no possibility of missing 'oldRoute'
				FlowRouter.go(context.oldRoute.name)
			}
		}
	}],
});

appRoutes.route('/', {
	name: 'walletStart',
	action() {
		mounter(BareLayoutBranded, {
      content: () => (<StartScreen/>)
    });
  },
	renderType: 'react'
})

appRoutes.route('/create', {
	name: 'walletCreate',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletCreate'});
	},
	back: {
		route: 'walletStart',
	},
	renderType: 'blaze'
});
appRoutes.route('/mnemonic-confirm', {
	name: 'walletMnemonicConfirm',
	// restric/direct access to this route
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletNewMnemonicConfirm'});
	},
	renderType: 'blaze'
})

appRoutes.route('/import', {
	name: 'walletImport',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletImport'});
	},
	back: {
		route: 'walletStart',
	},
	renderType: 'blaze'
});

appRoutes.route('/unlock', {
	name: 'walletUnlock',
	action() {
		mounter(MainLayout, {
			header: () => (<NavbarSimple/>),
      content: () => (<UnlockScreen/>),
    });
	},
	renderType: 'react'
})

appRoutes.route('/options', {
	name: 'options',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarSimple/>),
      content: () => (<UnlockOptionsScreen/>),
    });
	},
	back: {
		route: 'home',
	},
	renderType: 'react'
});

const walletRoutes = FlowRouter.group({
	name: 'walletRoutes',
	prefix: '/wallet',
	triggersEnter: [function (context, redirect){
		const newType = context.route.options.renderType
		const oldType = context.oldRoute && context.oldRoute.options && context.oldRoute.options.renderType
		if (newType !== oldType && typeof oldType !== 'undefined') {
			swapRenderer(newType)
		}
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
	},
	renderType: 'blaze'
});

walletRoutes.route('/accounts', {
	name: 'walletAccounts',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletAccounts'});
	},
	back: {
		route: 'walletAssets',
	},
	renderType: 'blaze'
})
walletRoutes.route('/assets', {
	name: 'walletAssets',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletAssets'});
	},
	renderType: 'blaze'
})
walletRoutes.route('/assetDetails/:symbol', {
	name: 'walletAssetDetails',
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletAssetDetails'});
	},
	back: {
		route: 'walletAssets',
	},
	renderType: 'blaze'
})
walletRoutes.route('/send/:asset?', {
	name: "walletSend",
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletSend'});
	},
	back: {
		route: 'walletAssets',
	},
	renderType: 'blaze'
})
walletRoutes.route('/receive', {
	name: "walletReceive",
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletReceive'});
	},
	back: {
		route: 'walletAssets',
	},
	renderType: 'blaze'
})
walletRoutes.route('/transactionsList', {
	name: "walletTransactionsList",
	action: function (params, queryParams) {
		BlazeLayout.render(mainFrame, {content:'walletTransactionsList'});
	},
	back: {
		route: 'walletAssets',
	},
	renderType: 'blaze'
});

