import React from 'react'
import { useTracker } from 'meteor/react-meteor-data'
import { UserAssets } from '/imports/api/collections/client_collections'
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
  const freezable = () => {
    return (symbol === 'RUNE')
  }
  return (
    <div className="row">

          <div className="col-12 text-center">

            <div className="d-flex justify-content-center my-2"><CircleIcon shortSymbol={balances.shortSymbol} size={Sizes.lg} /></div>
            <div className="h4">{token.name} {balances.shortSymbol}</div>
            <div className="my-4">{balances.symbol}</div>
            <div className="font-size-h3 text-center">{balances.full} <small>{balances.shortSymbol}</small></div>

          </div>

      <div className="col-12 d-flex justify-content-center">

        <div className="p-3 mx-2">
          <div>Free:</div>
          <div className="font-size-h4">{balances.free}</div>
        </div>

        <div className="p-3 mx-2">
          <div>Frozen:</div>
          <div className="font-size-h4">{balances.frozen}</div>
        </div>

        <div className="p-3 mxhh-2">
          <div>Locked:</div>
          <div className="font-size-h4">{balances.locked}</div>
        </div>

      </div>

      <div className="hr mb-4"></div>


      <div className="col-md-8 col-lg-6 ml-auto mr-auto">

        <div className="row">

          <div className="col-6 my-4">
            <button className="btn btn-primary w-100" onClick={() => FlowRouter.go('walletSend', {asset:symbol})}>send</button>
            {freezable && (
              <div className="input-group flex-column text-center">
                <button className="btn btn-text mt-3" onClick={() => FlowRouter.go('walletFreeze',{symbol:symbol})}>Freeze</button>
                <div className="small">Freeze assets on address</div>
              </div>
            )}
          </div>

          <div className="col-6 my-4">
            <button className="btn btn-primary w-100" onClick={() => FlowRouter.go('walletReceive')}>recieve</button>
            {freezable && (
              <div className="input-group flex-column text-center">
                <button className="btn btn-text mt-3" onClick={() => FlowRouter.go('walletUnfreeze',{symbol:symbol})}>Unfreeze</button>
                <div className="small">Unfreeze assets on address</div>
              </div>
            )}
          </div>


        </div>

      </div>

      <div className="col">
        <TransactionsTable transactions={userTransactions} />
      </div>
    </div>
  )
}
export default UserAssetDetailsScreen
