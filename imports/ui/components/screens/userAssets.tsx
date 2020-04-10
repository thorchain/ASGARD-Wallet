import React from "react";
import { useTracker } from 'meteor/react-meteor-data';
import { UserAssets } from '/imports/api/collections/client_collections'
import { UserAssetsTypes } from '/imports/api/collections/userAssetsCollection'
import { TokenData } from '/imports/api/collections/client_collections'
import { TokenDataTypes } from '/imports/api/collections/tokenDataCollection'

import { Row, Col, Typography, List } from 'antd'
import Block from "/imports/ui/components/elements/renewBlock/block";
import CircleIcon, { Sizes } from '/imports/ui/components/elements/circleIcon'
const { Title, Text } = Typography

const UserAssetsScreen: React.FC = (): JSX.Element => {
  const userAssets: UserAssetsTypes[] = useTracker(() => {
    return UserAssets.find({},{sort: {symbol: 1}}).fetch()
  }, [UserAssets])
  return (
    <Row>
      <Col>
        <Title level={4}>Assets</Title>
        <List dataSource={userAssets}
          renderItem={asset => (
            <List.Item key={asset._id} onClick={() => FlowRouter.go('walletAssetDetails', {symbol: asset.symbol})}>
              <AssetRow asset={asset}/>
            </List.Item>
          )}
        />
      </Col>
    </Row>
  )
}

export default UserAssetsScreen

type RowProps = {asset: UserAssetsTypes}
const AssetRow: React.FC<RowProps> = ({asset}): JSX.Element  => {
  const token: TokenDataTypes = useTracker(() => {
    return TokenData.findOne({symbol:asset.symbol})
  },[TokenData])
  return (
    <Block layout center>

      <Block style={{marginRight:16}}>
        <CircleIcon shortSymbol={asset.shortSymbol} size={Sizes.md}/>
      </Block>

      <Block flex baseline justifyStart>
        <Title level={4}>
          <span>[{asset.shortSymbol}]&nbsp;</span>
        </Title>
        <div>{token.name}&nbsp;</div>
        <Text strong type="secondary"><small>{asset.symbol}</small>&nbsp;</Text>
      </Block>

      <Block layout vertical end>
        <div className="h5 mb-0 text-right">{asset.free.toLocaleString()}</div>
        <div className="text-right font-italic text-muted small">0.00</div>
      </Block>
    </Block>
  )
}