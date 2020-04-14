import React, { useMemo } from 'react'
import { Session } from 'meteor/session'
import { WALLET } from '/imports/startup/client/init'
import { DeploymentUnitOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'

const NetworkIndicator: React.FC = (): JSX.Element => {
  const networkTypeClass = useMemo(() => {
    const network = Session.get('network') ? Session.get('network') : WALLET.getClient()
    if (network === 'mainnet') {
      return 'text-color-success'
    } else {
      return 'text-color-warning'
    }
  },[WALLET, Session])
  const titleText = useMemo(() => {
    const network = Session.get('network') ? Session.get('network') : WALLET.getClient()
    return network === 'mainnet' ? 'mainnet' : 'testnet'
  },[WALLET, Session])
  return (
    <Tooltip title={titleText}>
      <div style={{display:"inline-flex",marginRight:"12px"}}>
        <DeploymentUnitOutlined style={{fontSize:"28px"}} className={networkTypeClass} />
      </div>
    </Tooltip>
  )
}
export default NetworkIndicator
