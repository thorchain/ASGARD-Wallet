import React, { useCallback } from 'react'
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
  const link = (hash:string) => { return `${BNB.explorerBaseURL}/tx/${hash}` }
  const usr = useTracker(() =>UserAccount.findOne(),[UserAccount])
  const party = (tx:UserTransactionTypes) => {
    const from = tx.fromAddr
    const to = tx.toAddr
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

  }
  const handleRowClick = useCallback((hash) => {
    const url = link(hash)
    window.open(url, '_blank');
  },[])
  return (
    <Table size="small" dataSource={transactions} rowKey="_id" pagination={false}
      onRow={(record) => { 
        return {
          onClick: () => { handleRowClick(record.txHash)}
        }
      }}
    >
      <Table.Column
        title="Date"
        dataIndex="timeStamp"
        className="table-col-min"
        width="1px"
        render={timeStamp => {return momentShort(timeStamp).short()}}
      />
      <Table.Column
        title="Type"
        dataIndex="txType"
        className="table-col-min"
        width="1px"
        render={(value, tx:UserTransactionTypes) => { const p = party(tx)
          return (
          <span className={"text-color-" + p.color}>{p.msg}</span>
        )}}
      />
      <Table.Column
        title="With"
        dataIndex="txFrom"
        className="table-col-max"
        render={(value, tx:UserTransactionTypes) => { const p = party(tx)
          return (
            <Text ellipsis><Text strong>{p.label}:&nbsp;</Text><Text style={{fontFamily:'monospace'}}>{p.address}</Text></Text>
        )}}
      />
      <Table.Column
        title="Amount"
        dataIndex="txValue"
        align="right"
        width="1px"
        className="table-col-min"
        render={(value, tx:UserTransactionTypes) => { const p = party(tx)
          return (<>
              <Text className={`text-color-${p.color}` }>{p.op}{toCrypto(tx.value)}&nbsp;</Text>
              <Text type="secondary">{shortSymbol(tx.txAsset)}</Text>
        </>)}}
      />

    </Table>
  )
}
export default TransactionsTable
