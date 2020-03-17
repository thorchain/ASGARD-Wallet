import React from 'react';
import ReactDOM from "react-dom";
// import { Blaze } from 'meteor/blaze'
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount, withOptions } from 'react-mounter';

// import '/client/containers/appFrames.js'
// import '/client/components/wallet/walletNew/walletNewMnemonicConfirm.js'

import { WALLET } from '/imports/startup/client/init'
import { MainLayout, BareLayout, BareLayoutBranded } from '/imports/ui/components/containers/appFrames'
import NavbarMain from '/imports/ui/components/elements/navbarMain'
import NavbarSimple from '/imports/ui/components/elements/navbarSimple'

import StartScreen from '/imports/ui/components/screens/walletStart'
import ImportScreen from '/imports/ui/components/screens/walletNew/walletImport'
import CreateScreen from "/imports/ui/components/screens/walletNew/walletCreate"
import MnemonicConfirmScreen from '/imports/ui/components/screens/walletNew/walletImportMnemonicConfirm'

import UnlockScreen from '/imports/ui/components/screens/walletUnlock'
import UnlockOptionsScreen from '/imports/ui/components/screens/walletUnlockOptions'

import UserAccountScreen from '/imports/ui/components/screens/userAccount'
import UserAssetsScreen from '/imports/ui/components/screens/userAssets'
import UserAssetDetailsScreen from '/imports/ui/components/screens/userAssetDetails'
import UserTransactionsScreen from '/imports/ui/components/screens/transactions/userTransactions'

import SendFundsScreen from '/imports/ui/components/screens/sendFunds'
import ReceiveFundsScreen from '/imports/ui/components/screens/receiveFunds'
import FreezeFundsScreen from '/imports/ui/components/screens/freezeFunds'
import UnfreezeFundsScreen from '/imports/ui/components/screens/unfreezeFunds'

const mainFrame = 'mainAppFrame';

// SECURITY: Application, routing check
const isVault = () => {
	return window.localStorage.getItem('binance') ? true : false;
}
// SECURITY: Application, routing check
const isUnlocked = () => {
	return WALLET.isUnlocked() === true ? true : false;
}
const mounter = withOptions({
    rootId: '__react-root',
    rootProps: {'className': 'app-root'}
}, mount);

// TODO: Remove after full migration to React
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
		const newType = context.route.options.renderType
		const oldType = context.oldRoute && context.oldRoute.options && context.oldRoute.options.renderType
		if (newType !== oldType && typeof oldType !== 'undefined') {
			swapRenderer(newType)
		}
		
		if (context.route.name !== "options") {
			if (isVault() && !isUnlocked()) {
				FlowRouter.go('walletUnlock')
			} else if (isVault() && isUnlocked()) {
				// Redirect back to where came from
				// SECURITY: assumes 'unlocked' is non-persistant state
				// as is default on instantiation of wallet controller class
				// There should be no possibility of missing 'oldRoute'
				// ie. history since there is no way into this group of routes
				// except create/import/unlock
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

appRoutes.route('/create/:type?', {
	name: 'walletCreate',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<CreateScreen type={params.type}/>),
    });
	},
	back: {
		route: 'walletStart',
	},
	renderType: 'react'
});

appRoutes.route('/mnemonic-confirm', {
	name: 'walletMnemonicConfirm',
	// restric/direct access to this route
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<MnemonicConfirmScreen/>),
    });
	},
	renderType: 'react'
})

appRoutes.route('/import', {
	name: 'walletImport',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<ImportScreen/>),
    });
	},
	back: {
		route: 'walletStart',
	},
	renderType: 'react'
});
appRoutes.route('/unlock', {
	name: 'walletUnlock',
	action() {
		mounter(BareLayout, {
			header: () => (<NavbarSimple/>),
      content: () => (<UnlockScreen/>),
    });
	},
	renderType: 'react'
})

appRoutes.route('/options', {
	name: 'options',
	action: function (params, queryParams) {
		mounter(BareLayout, {
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
		// Until a dashboard or home view, we redirect
		FlowRouter.go('walletAssets');
	},
});

walletRoutes.route('/accounts', {
	name: 'walletAccounts',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<UserAccountScreen/>),
    });
	},
	renderType: 'react'
})

walletRoutes.route('/assets', {
	name: 'walletAssets',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<UserAssetsScreen/>),
    });
	},
	renderType: 'react'
})
walletRoutes.route('/assetDetails/:symbol', {
	name: 'walletAssetDetails',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<UserAssetDetailsScreen symbol={params.symbol}/>),
    });
	},
	back: {
		route: 'walletAssets',
	},
	renderType: 'react'
})
walletRoutes.route('/transactionsList', {
	name: "walletTransactionsList",
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<UserTransactionsScreen/>),
    });
	},
	back: {
		route: 'walletAssets',
	},
	renderType: 'react'
});
walletRoutes.route('/send/:symbol?', {
	name: "walletSend",
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<SendFundsScreen symbol={params.symbol}/>),
    });
	},
	back: {
		route: 'walletAssets',
	},
	renderType: 'react'
})
walletRoutes.route('/receive', {
	name: "walletReceive",
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<ReceiveFundsScreen/>),
    });
	},
	back: {
		route: 'walletAssets',
	},
	renderType: 'react'
})
walletRoutes.route('/freeze/:symbol', {
	name: 'walletFreeze',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<FreezeFundsScreen symbol={params.symbol}/>),
    });
	},
	back: {
		route: 'walletAssets'
	},
	renderType: 'react'
})
walletRoutes.route('/unfreeze/:symbol', {
	name: 'walletUnfreeze',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<UnfreezeFundsScreen symbol={params.symbol}/>),
    });
	},
	back: {
		route: 'walletAssets'
	},
	renderType: 'react'
})

