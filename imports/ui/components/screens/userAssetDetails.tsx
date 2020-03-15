import React from 'react'
import { useTracker } from 'meteor/react-meteor-data'
import { UserAssets, UserAccount } from '/imports/api/collections/client_collections'
import { UserAssetsTypes } from '/imports/api/collections/userAssetsCollection'
import { UserTransactions } from '/imports/api/collections/client_collections'
import { UserTransactionTypes } from '/imports/api/collections/userTransactionsCollection'
import { TokenData } from '/imports/api/collections/client_collections'
import { TokenDataTypes } from '/imports/api/collections/tokenDataCollection'

import TransactionsTable from '/imports/ui/components/screens/transactions/transactionsTable'

import CircleIcon, { Sizes } from '/imports/ui/components/elements/circleIcon'

type Props = {symbol: string}
const UserAssetDetailsScreen: React.FC<Props> = ({symbol}): JSX.Element => {
  const balances: UserAssetsTypes = useTracker(() => {
    const res = UserAssets.findOne({symbol: symbol})
    res.full = parseFloat(res.free) + parseFloat(res.locked) + parseFloat(res.frozen)
    return res
  },[])
  const token: TokenDataTypes = useTracker(() => {
    return TokenData.findOne({symbol: symbol})
  },[])
  const userTransactions: UserTransactionTypes[] = useTracker(() => {
    return UserTransactions.find({txAsset:symbol},{sort: {timeStamp: -1}}).fetch()
  }, [])
  const freezable = () => balances.free > 0
  const unfreezable = () => balances.frozen > 0
  const sendable = () =>  balances.free > 0
  const goRoute = (route: string) => {
    // workaroudn for inconsistent conventions.
    // TODO: Fix when migrating desination component (walletSend)
    const params = {symbol:symbol}
    switch (route) {
      case 'walletSend':
        sendable() && FlowRouter.go(route,params)
        break;
      case 'walletFreeze':
        freezable() && FlowRouter.go(route,params)
        break;
      case 'walletUnfreeze':
        unfreezable() && FlowRouter.go(route,params)
        break;
      case 'walletReceive':
        FlowRouter.go(route)
        break;
    
      default:
        break;
    }

  }
  return (
    <div className="row">

          <div className="col-12 text-center">

            <div className="d-flex justify-content-center my-2"><CircleIcon shortSymbol={balances.shortSymbol} size={Sizes.lg} /></div>
            <div className="h4">{token.name} {balances.shortSymbol}</div>
            <div className="my-4">{balances.symbol}</div>
            <div className="font-size-h3 text-center">{balances.full} <small>{balances.shortSymbol}</small></div>

          </div>

      <div className="col-12 d-flex justify-content-center text-center">

        <div className="p-3 mx-2">
          <div>Free:</div>
          <div className="font-size-h4">{balances.free}</div>
        </div>

        <div className="p-3 mx-2">
          <div>Frozen:</div>
          <div className="font-size-h4">{balances.frozen}</div>
        </div>

        <div className="p-3 mx-2">
          <div>Locked:</div>
          <div className="font-size-h4">{balances.locked}</div>
        </div>

      </div>

      <div className="hr mb-4"></div>


      <div className="col-md-8 col-lg-6 ml-auto mr-auto">

        <div className="row">

          <div className="col-6 my-4">
            <button className={"btn btn-primary w-100 " + (!sendable() && ("disabled"))} onClick={() => goRoute('walletSend')}>send</button>
            <div className="input-group flex-column text-center">
              <button className={"btn btn-text mt-3 " + (!freezable() && ("disabled"))} onClick={() => goRoute('walletFreeze')}>Freeze</button>
              <div className="small">Freeze assets on address</div>
            </div>
          </div>

          <div className="col-6 my-4">
            <button className="btn btn-primary w-100" onClick={() => goRoute('walletReceive')}>recieve</button>
            <div className="input-group flex-column text-center">
              <button className={"btn btn-text mt-3 " + (!unfreezable() && ("disabled"))} onClick={() => goRoute('walletUnfreeze')}>Unfreeze</button>
              <div className="small">Unfreeze assets on address</div>
            </div>
          </div>


        </div>

      </div>

      <div className="col-12">
        <TransactionsTable transactions={userTransactions} />
      </div>
    </div>
  )
}
export default UserAssetDetailsScreen
