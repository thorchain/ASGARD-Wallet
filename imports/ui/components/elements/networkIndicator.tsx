import React, { useMemo } from 'react'
import { WALLET } from '/imports/startup/client/init'
import { DeploymentUnitOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'

const NetworkIndicator: React.FC = (): JSX.Element => {
  const networkTypeClass = useMemo(() => {
    const client = WALLET.getClient()
    if (client?.network === 'mainnet') {
      return 'text-color-success'
    } else {
      return 'text-color-warning'
    }
  },[WALLET])
  const titleText = useMemo(() => {
    const client = WALLET.getClient()
    return client?.network === 'mainnet' ? 'mainnet' : 'testnet'
  },[WALLET])
  return (
    <Tooltip title={titleText}>
      <div style={{display:"inline-flex",marginRight:"12px"}}>
        <DeploymentUnitOutlined style={{fontSize:"28px"}} className={networkTypeClass} />
      </div>
    </Tooltip>
  )
}
export default NetworkIndicator
