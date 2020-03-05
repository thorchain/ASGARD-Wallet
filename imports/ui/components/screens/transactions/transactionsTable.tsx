import React, { useMemo } from 'react'
import { UserAccount } from '/imports/api/collections/client_collections'
import { UserTransactionTypes } from '/imports/api/collections/userTransactionsCollection'
const momentShort = require('moment-shortformat')

type Props = {transactions: UserTransactionTypes[]}
const TransactionsTable: React.FC<Props> = ({transactions}): JSX.Element => {
  return (
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
        {transactions.map((transaction) => {
          return <TableRow transaction={transaction} key={transaction._id} />
        })}
      </tbody>

    </table>

  )
}
export default TransactionsTable

type RowProps = { transaction: UserTransactionTypes }
const TableRow: React.FC<RowProps> = (props): JSX.Element => {
  const tx = props.transaction
  const timeShort = (d: Date) => {
    return momentShort(d).short()
  }
  const party:{ msg: string; address: string} = useMemo(() => {
    const usr = UserAccount.findOne()
    if (tx.fromAddr === usr.address) {
      return {msg:"To:", address:tx.toAddr}
    } else {
      return {msg:"From:", address:tx.fromAddr}
    }

  }, [])
  const shortSym = (symbol: string) => {
      return symbol.split("-")[0].substr(0,4)
  }
  return (
    <tr>

      <td className="text-nowrap">{timeShort(tx.timeStamp)}</td>
      <td className="text-capitals">{tx.txType}</td>

      <td className="px-0" colSpan={2}>
        <div className="row m-0">
        
            <div className="col-sm-2 col-md-2 p-0 px-1 text-truncate font-weight-bold">{party.msg}</div>
            <div className="col-sm-10 col-md-10 p-0 px-1 text-truncate">{party.address}</div>

        </div>
      </td>

      <td>{tx.value} {shortSym(tx.txAsset)}</td>
      <td className="text-center"><a href="{{link txHash}}" target="_blank"><i className="fa fa-external-link-square-alt"></i></a></td>

    </tr>

  )
}