import React, { useState, useEffect } from 'react'
import { useTracker, withTracker } from 'meteor/react-meteor-data'
import { Menu, Button } from 'antd'
import { NavBar, Icon, Drawer } from 'antd-mobile'
import { MenuOutlined } from '@ant-design/icons'

import NavBreadcrumb from '/imports/ui/components/elements/breadcrumb/navBreadcrumb'
import './navMenuMain.less'
import { WALLET } from '/imports/startup/client/init'

const NavMenuSimple: React.FC = (): JSX.Element => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false)
  const [networkConnected, setNetworkConnected] = useState<boolean | null>(false)
  useEffect(() => {
    console.log("seeing network status")
    setNetworkConnected(WALLET.getConnected())
  },[WALLET])
  const handleChangeDrawer = () => {
    setDrawerIsOpen(!drawerIsOpen)
  }
  const handleMenuClick = () => {
    console.log('clicked the menu item...')
    setDrawerIsOpen(!drawerIsOpen)
  }
  const handleLeftClick = () => {
    console.log('clicked left...')
  }
  return (<>

    <NavBar
      className="navbar-mobile"
      mode="dark"
      icon={<Icon type="left" />}
      onLeftClick={handleLeftClick}
      leftContent={[<NavBreadcrumb/>]}
      rightContent={[
        // <>{!networkConnected && <div key="0">!!&nbsp;</div>}</>,
        // <Icon key="0" type="search" style={{ marginRight: '16px' }} />,
        <Button key="0" onClick={handleChangeDrawer}>
          <MenuOutlined />
        </Button>
      ]}
    >
      <a className="navbar-brand text-uppercase font-size-h5" href={FlowRouter.path('home')}>
        <img src="/img/Asgard-Tri-White.png" className="float-left mr-2" width="28" height="28" alt="" />
        <strong>Asgard</strong><small className='text-color-secondary'>&nbsp;BETA</small>
      </a>
    </NavBar>
    <Drawer
      position="top"
      className="my-drawer"
      style={{ minHeight: document.documentElement.clientHeight }}
      contentStyle={{paddingTop: 42 }}
      sidebar={<SimpleTopMenu handler={handleMenuClick}/>}
      open={drawerIsOpen}
      onOpenChange={handleChangeDrawer}
    >
    </Drawer>

  </>)
}

export default NavMenuSimple

const SimpleTopMenu: React.FC<{handler:()=>void}> = ({handler}): JSX.Element => {
  const [selected, setSelected] = useState([''])
  useTracker(() => {
    setSelected([FlowRouter.current().route.name])
    FlowRouter.watchPathChange();
  },[FlowRouter])
  return (
    <Menu onClick={handler}
      selectedKeys={selected}
    >
      <Menu.Item key="options">
        <a href="" onClick={() => FlowRouter.go('options')}>Options</a>
      </Menu.Item>
      <Menu.Item key="walletUnlock">
        <a href="" onClick={() => FlowRouter.go('walletUnlock')}>Unlock</a>
      </Menu.Item>
    </Menu>
  )
}