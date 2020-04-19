import React, { useState } from 'react'
import { useTracker } from 'meteor/react-meteor-data';
import { Breadcrumb } from 'antd'
import { LeftOutlined } from '@ant-design/icons';
import './navBreadcrumbStyles.less'

const NavBreadcrumb: React.FC = (): JSX.Element => {
  const [canBack, setCanBack] = useState(false)
  useTracker(() => {
    const isVault = window.localStorage.getItem('binance') ? true : false;
    FlowRouter.watchPathChange()
    const current = FlowRouter.current()
    if (isVault && current.oldRoute && current.oldRoute.group && current.oldRoute.group.name === 'walletRoutes') {
      setCanBack(true)
      // Can assume this is only signup routes
    } else if (!isVault) {
      setCanBack(true)
    } else {
      setCanBack(false)
    }
  },[FlowRouter])
  const goBack = () => {
    if (canBack) { window.history.back() }
  }
  return (
    <Breadcrumb>
      {canBack && (
        <Breadcrumb.Item key="0">
          <a href="" onClick={goBack}><LeftOutlined />&nbsp;<span>Back</span></a>
        </Breadcrumb.Item>
      )}
    </Breadcrumb>
  )
}
export default NavBreadcrumb
