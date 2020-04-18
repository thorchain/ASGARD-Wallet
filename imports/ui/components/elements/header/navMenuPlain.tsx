import React, { useState } from 'react'
import { useTracker } from 'meteor/react-meteor-data'
import { Menu, Button } from 'antd'
import { NavBar, Drawer } from 'antd-mobile'
import { MenuOutlined } from '@ant-design/icons'

import './navMenuStyles.less'

import NetworkIndicator from '/imports/ui/components/elements/networkIndicator'

const NavMenuPlain: React.FC = (): JSX.Element => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false)
  const handleChangeDrawer = () => {
    setDrawerIsOpen(!drawerIsOpen)
  }
  const handleMenuClick = () => {
    setDrawerIsOpen(!drawerIsOpen)
  }
  return (<>
    <NavBar
      className="navbar-mobile navbar-transparent"
      mode="dark"
      rightContent={[
        <div key="0">
          <NetworkIndicator/>
          <Button size="large" style={{border:"none"}} onClick={handleChangeDrawer}>
            <MenuOutlined />
          </Button>
        </div>
      ]}
    >
      <a href={FlowRouter.path('home')} key="0">
        <img src="/img/Asgard-Tri-White.png" className="float-left mr-2" width="28" height="28" alt="" />
        <strong className="font-brand text-uppercase">Asgard</strong><small className='text-color-secondary'>&nbsp;BETA</small>
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
    ></Drawer>

  </>)
}

export default NavMenuPlain

const SimpleTopMenu: React.FC<{handler:()=>void}> = ({handler}): JSX.Element => {
  const [selected, setSelected] = useState([''])
  useTracker(() => {
    setSelected([FlowRouter.current().route.name])
    FlowRouter.watchPathChange();
  },[FlowRouter])
  return (
    <Menu onClick={handler}
      selectedKeys={selected}
      theme="dark"
    >
      <Menu.Item key="walletUnlockOptions">
        <a href="" onClick={() => FlowRouter.go('walletUnlockOptions')}>Options</a>
      </Menu.Item>
      <Menu.Item key="walletUnlock">
        <a href="" onClick={() => FlowRouter.go('walletUnlock')}>Unlock</a>
      </Menu.Item>
    </Menu>
  )
}
