import React, { useMemo } from 'react'
import { UserAccount } from '/imports/api/collections/client_collections'
import { UserTransactionTypes } from '/imports/api/collections/userTransactionsCollection'
import { toCrypto } from '/imports/ui/lib/numbersHelpers'
import { List, Typography } from 'antd'
const { Text } = Typography
import Block from '/imports/ui/components/elements/block/block'

type Props = {transactions: UserTransactionTypes[]}
const TransactionsList: React.FC<Props> = ({transactions}): JSX.Element => {
  return (
    <List dataSource={transactions}
      renderItem={transaction => (
       <List.Item key={transaction._id} >
          <ItemRow transaction={transaction} key={transaction._id} />
       </List.Item>
      )}>
    </List>
  )
}
export default TransactionsList

type ItemProps = { transaction: UserTransactionTypes }
const ItemRow: React.FC<ItemProps> = (props): JSX.Element => {
  const tx = props.transaction
  type PartyTypes = {msg: string, label: string, address: string, color: string, op: string}
  const party: PartyTypes = useMemo(() => {
    const from = tx.fromAddr
    const to = tx.toAddr
    const usr = UserAccount.findOne()
    switch (tx.txType) {
      case 'TRANSFER':
        if (from === usr.address) {
          return {msg:"send", label: "to", address:to, color:"error", op:"-"}
        } else {
          return {msg:"receive", label: "from", address:from, color:"success", op:"+"}
        }
      case 'FREEZE_TOKEN':
        return {msg:"freeze", label: "from", address:from, color:"info", op:"-"}
      case 'UN_FREEZE_TOKEN':
        return {msg:"unfreeze", label: "to", address:from, color:"warning", op:"+"}
      default:
        return {msg:'',label:'',address:'',color:'',op:''}
    }
  },[])
  const shortSym = (symbol: string) => {
    return symbol.split("-")[0].substr(0,4)
  }

  return (
    <Block layout center>

      <Block flex style={{maxWidth:'84px'}}>
        <Text className={"text-color-" + party.color}>{party.msg}</Text>
      </Block>

      <Block layout horizontal center style={{flexWrap:'nowrap',overflow:'hidden',whiteSpace:'wowrap'}}>
        <Text ellipsis>
          <strong style={{textTransform:'capitalize',marginRight:12}}>{party.label}:</strong><span className="small text-monospace">{party.address}</span>
        </Text>
        <Block layout vertical end style={{width:62}}>
          <div className={"text-color-" + party.color}>{party.op}{toCrypto(tx.value)}</div>
          <div className={"text-color-secondary"}>[{shortSym(tx.txAsset)}]</div>
        </Block>
      </Block>

    </Block>
  )
}
