import React, { useMemo } from 'react'
import { UserAccount } from '/imports/api/collections/client_collections'
import { UserTransactionTypes } from '/imports/api/collections/userTransactionsCollection'
import { toCrypto } from '/imports/ui/lib/numbersHelpers'
import { shortSymbol } from '/imports/ui/lib/tokenHelpers'
import { BNB } from '/imports/api/wallet'
import { Typography, Table } from 'antd'
import { useTracker } from 'meteor/react-meteor-data'
const { Text } = Typography
const momentShort = require('moment-shortformat')

type Props = {transactions: UserTransactionTypes[]}
const TransactionsTable: React.FC<Props> = ({transactions}): JSX.Element => {

  const usr = useTracker(() =>UserAccount.findOne(),[UserAccount])
  // type PartyTypes = {msg: string, label: string, address: string, color: string, op: string}
  // msg
  // label
  // address
  // color
  // op
  const party = (tx:any) => {
    const from = tx.fromAddr
    const to = tx.toAddr
    // const usr = UserAccount.findOne()
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
        return {msg:'',label:'',address:'',color:'',op:''}
    }

  }
  return (<>
    <Table size="small" dataSource={transactions} rowKey="_id" pagination={false}>
      <Table.Column
        title="Date"
        dataIndex="timeStamp"
        // key="timeStamp"
        // render={(timeStamp) => { console.log(timeStamp); return timeStamp}}
        render={timeStamp => {return momentShort(timeStamp).short()}}
        // render={tx => (
        //   <span>
        //     {tags.map(tag => (
        //       <Tag color="blue" key={tag}>
        //         {tag}
        //       </Tag>
        //     ))}
        //   </span>
        // )}
      />
      <Table.Column
        title="Type"
        dataIndex="txType"
        render={(text, record, index) => {
          const p = party(record)
          return (
          <span className={"text-color-" + p.color}>{p.msg}</span>
        )}}
        // key="txType"
        // onCell={someData => {console.log(someData); return (<span>'test'</span>)}}
        // render={type => party(type)}
      />
      <Table.Column
        title="With"
        dataIndex="txFrom"
        render={(text, record, index) => {
          const p = party(record)
          return (<>
            <div>{p.label}&nbsp;{p.address}</div>
        </>)}}
        // key="txType"
        // onCell={someData => {console.log(someData); return (<span>'test'</span>)}}
        // render={type => party(type)}
      />

    </Table>
    <table className="table table-sm table-dark table-borderless">
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Type</th>
          <th scope="col">With</th>
          <th scope="col"></th>
          <th scope="col">Amount</th>
          <th scope="col">View</th>
        </tr>
      </thead>
      
      <tbody>
        {transactions.map((transaction) => (
          <TableRow transaction={transaction} key={transaction._id} />
        ))}
      </tbody>

    </table>

  </>)
}
export default TransactionsTable

type RowProps = { transaction: UserTransactionTypes }
const TableRow: React.FC<RowProps> = (props): JSX.Element => {
  const tx = props.transaction
  const link = (hash:string) => {
    return BNB.explorerBaseURL + "/tx/" + hash
  }
  // TODO: Refactor this out into helper
  // doubled up in transactionsList.tsx
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
        return {msg:'',label:'',address:'',color:'',op:''}
    }

  },[])
  return (
    <tr>

      <td className="text-nowrap">{momentShort(tx.timeStamp).short()}</td>
      <td className={"text-uppercase text-" + party.color}>{party.msg}</td>

      <td className="px-0" colSpan={2}>
        <div className="row m-0">
        
            <div className="col-sm-2 col-md-2 p-0 px-1 text-truncate font-weight-bold">{party.label}</div>
            <div className="col-sm-10 col-md-10 p-0 px-1 text-truncate">{party.address}</div>

        </div>
      </td>

      <td className="text-right"><Text className={"text-color-" + party.color }>{party.op}{toCrypto(tx.value)}</Text> <Text>{shortSymbol(tx.txAsset)}</Text></td>
      <td className="text-center"><a href={link(tx.txHash)} target="_blank"><i className="fa fa-external-link-square-alt"></i></a></td>

    </tr>

  )
}