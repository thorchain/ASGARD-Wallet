import React, { useState, useCallback } from 'react'
import { useTracker } from 'meteor/react-meteor-data'
import { WALLET } from '/imports/startup/client/init'
import { Menu, Button } from 'antd'
import { NavBar, Drawer } from 'antd-mobile'
import { MenuOutlined } from '@ant-design/icons'

import NavBreadcrumb from '/imports/ui/components/elements/breadcrumb/navBreadcrumb'
import './navMenuStyles.less'

const NavMenuMain: React.FC = (): JSX.Element => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const handleChangeDrawer = () => {
    console.log('clicked toggle menu')
    setDrawerOpen(!drawerOpen)
  }
  const handleMenuClick = () => {
    setDrawerOpen(!drawerOpen)
  }
  const handleLeftClick = () => {
    console.log("clicked left menu")
  }
  return (<>
    <NavBar
      className="navbar-mobile"
      mode="dark"
      // icon={<Icon type="left" />}
      onLeftClick={handleLeftClick}
      leftContent={[<NavBreadcrumb/>]}
      rightContent={[
        <Button size="large" key="0" onClick={handleChangeDrawer}>
          <MenuOutlined/>
        </Button>
      ]}
    >
      <a href={FlowRouter.path('home')} key="0">
        <img src="/img/Asgard-Tri-White.png" className="float-left mr-2" width="28" height="28" alt="" />
        <strong className="text-uppercase">Asgard</strong><small className='text-color-secondary'>&nbsp;BETA</small>
      </a>
    </NavBar>
    <Drawer
      position="top"
      className="my-drawer"
      style={{ minHeight: document.documentElement.clientHeight }}
      contentStyle={{paddingTop: 42 }}
      sidebar={<TopMenu handler={handleMenuClick}/>}
      open={drawerOpen}
      onOpenChange={handleChangeDrawer}
    ></Drawer>
  </>)
}
export default NavMenuMain

const TopMenu: React.FC<{handler:()=>void}> = ({handler}): JSX.Element => {
  const [selected, setSelected] = useState([''])
  useTracker(() => {
    console.log('set selected menu item')
    setSelected([FlowRouter.current().route.name])
    FlowRouter.watchPathChange();
  },[FlowRouter])
  const lockWallet = useCallback(async () => {
    await WALLET.lock()
    FlowRouter.go('walletUnlock')
  },[])
  return (
    <Menu onClick={handler}
      selectedKeys={selected}
      theme="dark"
    >
      <Menu.Item key="walletAssets">
        <a href="" onClick={() => FlowRouter.go('walletAssets')}>Assets</a>
      </Menu.Item>
      <Menu.Item key="walletTransactionsList">
        <a href="" onClick={() => FlowRouter.go('walletTransactionsList')}>Transactions</a>
      </Menu.Item>
      <Menu.Item key="walletSend">
        <a href="" onClick={() => FlowRouter.go('walletSend')}>Send Funds</a>
      </Menu.Item>
      <Menu.Item key="walletReceive">
        <a href="" onClick={() => FlowRouter.go('walletReceive')}>Receive Funds</a>
      </Menu.Item>
      <Menu.Item key="walletAccounts">
        <a href="" onClick={() => FlowRouter.go('walletAccounts')}>Accounts</a>
      </Menu.Item>
      <Menu.Item>
        <a href="" onClick={lockWallet}>Lock</a>
      </Menu.Item>
    </Menu>
  )
}