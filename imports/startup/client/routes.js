import React from 'react';
import ReactDOM from "react-dom";
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount, withOptions } from 'react-mounter';

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
});
appRoutes.route('/unlock', {
	name: 'walletUnlock',
	action() {
		mounter(BareLayout, {
			header: () => (<NavbarSimple/>),
      content: () => (<UnlockScreen/>),
    });
	},
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
			header: () => (<NavbarMain/>),
      content: () => (<UserAccountScreen/>),
    });
	},
})

walletRoutes.route('/assets', {
	name: 'walletAssets',
	action: function (params, queryParams) {
		mounter(MainLayout, {
			header: () => (<NavbarMain/>),
      content: () => (<UserAssetsScreen/>),
    });
	},
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
})

