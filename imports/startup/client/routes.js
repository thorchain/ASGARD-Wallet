import React from 'react';
import ReactDOM from 'react-dom'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { mount, withOptions } from 'react-mounter'

import { WALLET } from '/imports/startup/client/init'
import { MainLayout, BareLayout, BareLayoutBranded } from '/imports/ui/components/containers/appFrames'
import NavMenuMain from '/imports/ui/components/elements/header/menuMain'
import NavMenuPlain from '/imports/ui/components/elements/header/navMenuPlain'
import NavMenuSimple from '/imports/ui/components/elements/header/navMenuSimple'
import NavbarMain from '/imports/ui/components/elements/header/navbarMain'
import NavbarSimple from '/imports/ui/components/elements/header/navbarSimple'

import StartScreen from '/imports/ui/components/screens/walletStart'
import ImportScreen from '/imports/ui/components/screens/walletNew/walletImport'
import WalletNewOptionsScreen from '/imports/ui/components/screens/walletNew/walletNewOptions'
import CreateScreen from '/imports/ui/components/screens/walletNew/walletCreate'
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


const appRoutes = FlowRouter.group({
	name: 'mainAppRoutes',
	triggersEnter: [function (context, redirect) {
		const route = context.route
		if (route.name !== "walletUnlockOptions") {
			if (isVault() && !isUnlocked()) {
				FlowRouter.go('walletUnlock')
			} else if (isVault() && isUnlocked()) {
				// Redirect back to where came from
				// SECURITY: assumes 'unlocked' is non-persistant state
				// as is default on instantiation of wallet controller class
				// There should be no possibility of missing 'oldRoute'
				// ie. history since there is no way into this group of routes
				// except create/import/unlock
				if (context.oldRoute && context.oldRoute.name) {
					FlowRouter.go(context.oldRoute.name)
				}
			} else if (!isVault() && (route.name === 'walletUnlock' || route.name === 'walletUnlockOptions')) {
				FlowRouter.go('walletStart')
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
})

appRoutes.route('/create/:type?', {
	name: 'walletCreate',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuSimple/>),
      content: () => (<CreateScreen type={params.type}/>),
    });
	},
	back: {
		route: 'walletStart',
	},
});

appRoutes.route('/mnemonic-confirm', {
	name: 'walletMnemonicConfirm',
	// restric/direct access to this route
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuSimple/>),
      content: () => (<MnemonicConfirmScreen/>),
    });
	},
})

appRoutes.route('/import/:type?', {
	name: 'walletImport',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuSimple/>),
      content: () => (<ImportScreen/>),
    });
	},
	back: {
		route: 'walletStart',
	},
});
appRoutes.route('/import-options', {
	name: 'walletImportOptions',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuSimple/>),
      content: () => (<WalletNewOptionsScreen/>),
    });
	},
	back: {
		route: 'walletStart',
	},
});
appRoutes.route('/unlock', {
	name: 'walletUnlock',
	action() {
		mounter(BareLayout, {
			header: () => (<NavMenuPlain/>),
      content: () => (<UnlockScreen/>),
    });
	},
})

appRoutes.route('/unlock-options', {
	name: 'walletUnlockOptions',
	action: function (params, queryParams) {
		mounter(BareLayout, {
			header: () => (<NavMenuPlain/>),
      content: () => (<UnlockOptionsScreen/>),
    });
	},
	back: {
		route: 'home',
	},
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
		// Until a dashboard or home view, we redirect
		FlowRouter.go('walletAssets');
	},
});

walletRoutes.route('/accounts', {
	name: 'walletAccounts',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuMain/>),
      content: () => (<UserAccountScreen/>),
    });
	},
})

walletRoutes.route('/assets', {
	name: 'walletAssets',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuMain/>),
      content: () => (<UserAssetsScreen/>),
    });
	},
})
walletRoutes.route('/assetDetails/:symbol', {
	name: 'walletAssetDetails',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuMain/>),
      content: () => (<UserAssetDetailsScreen symbol={params.symbol}/>),
    });
	},
	back: {
		route: 'walletAssets',
	},
})
walletRoutes.route('/transactionsList', {
	name: "walletTransactionsList",
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuMain/>),
      content: () => (<UserTransactionsScreen/>),
    });
	},
	back: {
		route: 'walletAssets',
	},
});
walletRoutes.route('/send/:symbol?', {
	name: "walletSend",
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuMain/>),
      content: () => (<SendFundsScreen symbol={params.symbol}/>),
    });
	},
	back: {
		route: 'walletAssets',
	},
})
walletRoutes.route('/receive', {
	name: "walletReceive",
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuMain/>),
      content: () => (<ReceiveFundsScreen/>),
    });
	},
	back: {
		route: 'walletAssets',
	},
})
walletRoutes.route('/freeze/:symbol', {
	name: 'walletFreeze',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuMain/>),
      content: () => (<FreezeFundsScreen symbol={params.symbol}/>),
    });
	},
	back: {
		route: 'walletAssets'
	},
})
walletRoutes.route('/unfreeze/:symbol', {
	name: 'walletUnfreeze',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavMenuMain/>),
      content: () => (<UnfreezeFundsScreen symbol={params.symbol}/>),
    });
	},
	back: {
		route: 'walletAssets'
	},
})

