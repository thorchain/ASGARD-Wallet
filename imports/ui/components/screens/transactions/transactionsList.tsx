import React, { useMemo } from 'react'
import { UserAccount } from '/imports/api/collections/client_collections'
import { UserTransactionTypes } from '/imports/api/collections/userTransactionsCollection'
import { toCrypto } from '/imports/ui/lib/numbersHelpers'

type Props = {transactions: UserTransactionTypes[]}
const TransactionsList: React.FC<Props> = ({transactions}): JSX.Element => {
  return (
    <ul className="list-group">
      {transactions.map((transaction) => (
        <ListItem transaction={transaction} key={transaction._id} />
      ))}
      
    </ul>
  )
}
export default TransactionsList

type ItemProps = { transaction: UserTransactionTypes }
const ListItem: React.FC<ItemProps> = (props): JSX.Element => {
  const tx = props.transaction
  type PartyTypes = {msg: string, label: string, address: string, color: string, op: string}
  const party: PartyTypes = useMemo(() => {
    const from = tx.fromAddr
    const to = tx.toAddr
    const usr = UserAccount.findOne()
    switch (tx.txType) {
      case 'TRANSFER':
        if (from === usr.address) {
          return {msg:"send", label: "to", address:to, color:"danger", op:"-"}
        } else {
          return {msg:"receive", label: "from", address:from, color:"success", op:"+"}
        }
      case 'FREEZE_TOKEN':
        return {msg:"freeze", label: "from", address:from, color:"info", op:"-"}
      case 'UN_FREEZE_TOKEN':
        return {msg:"unfreeze", label: "to", address:from, color:"warning", op:"+"}
      default:
        break;
    }
    // return empty
    return {msg:'',label:'',address:'',color:'',op:''}

  },[])
  const shortSym = (symbol: string) => {
    return symbol.split("-")[0].substr(0,4)
  }

  return (
    <li className="media list-group-item p-1">
    <div className="media-body d-flex align-items-center justify-content-start">

      <div className={"d-md-none col-2 col-lg-1 px-1 font-weight-bold small text-uppercase text-" + party.color}>{party.msg}</div>
      <div className={"d-none d-md-block col-2 col-lg-1 px-1 font-weight-bold text-uppercase text-" + party.color }>{party.msg}</div>

      <div className="text-truncate mr-auto p-1">
        <div className="text-truncate"><strong className="font-weight-bold small pr-2">{party.label}:</strong><span className="small text-monospace">{party.address}</span></div>
      </div>

      <div className="pl-1">
        <div className="text-right">
          <span className={"d-block text-" + party.color}>{party.op}{toCrypto(tx.value)}</span>
          <span className="d-none d-md-inline-block text-muted" style={{width: "62px"}}>[{shortSym(tx.txAsset)}]</span>
          <span className="d-block d-md-none small text-muted">[{shortSym(tx.txAsset)}]</span>
        </div>
      </div>

    </div>
  </li>
  )
}
