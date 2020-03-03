import React from "react";
import { useTracker } from 'meteor/react-meteor-data';
import { UserAssets } from '/client/lib/client_collections'
import { UserAssetsTypes } from '/imports/api/collections/UserAssetsCollection'
import { TokenData } from '/client/lib/client_collections'
import { TokenDataTypes } from '/imports/api/collections/TokenDataCollection'
// TODO: Add MarketData & types

import CircleIcon, { Sizes } from '/imports/ui/components/elements/circleIcon'

const UserAssetsScreen: React.FC = (): JSX.Element => {
  // Assumed no need for pagination for now
  // Hard to imagine more than a couple of dozen on the high end
  // TODO: Can also hide zero balances using mongo query doc
  const userAssets: UserAssetsTypes[] = useTracker(() => {
    return UserAssets.find().fetch()
  }, [])
  return (
    <div>
      <h5 className="text-center mb-4">Assets</h5>
      <ul className="list-unstyled list-links">
      {userAssets.map(asset => { return (
        <ListItem asset={asset} key={asset._id}/>
      )})}
      </ul>

    </div>
  )

}

export default UserAssetsScreen


type Props = {asset: UserAssetsTypes}
const ListItem: React.FC<Props> = (props): JSX.Element  => {
  const asset = props.asset
  const token: TokenDataTypes = useTracker(() => {
    return TokenData.findOne({symbol:asset.symbol})
  },[])
  const price = (symbol: string) => { 
    return symbol
    // get market data
    // MarketData.findOne({symbol:symbol})
  }
  return (
    <li className="d-flex justify-content-between align-items-center mb-1 p-2"
      onClick={() => FlowRouter.go('walletAssetDetails', {symbol: asset.symbol})}
      key={asset._id}>

      <div className="mr-3">
        <CircleIcon shortSymbol={asset.shortSymbol} size={Sizes.md}/>
      </div>

      <div className="mr-auto overflow-hidden">

        <div className="d-md-flex align-items-md-baseline">
          <div className="h5 mb-0 text-truncate mr-3">
            <span className="font-weight-bold">[{asset.shortSymbol}]</span>&nbsp;
            <span className="font-weight-normal">{token.name}</span>
          </div>
          <div className="small font-weight-bold text-muted">{asset.symbol}</div>
        </div>

      </div>

      <div>
        <div className="h5 mb-0 text-right">{asset.free}</div>
        <div className="text-right font-italic color-grey small">{price('9.99')}</div>
      </div>

    </li>
    
  )
}