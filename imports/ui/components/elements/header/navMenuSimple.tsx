import React, { useState } from 'react'
import { useTracker } from 'meteor/react-meteor-data'
import { Menu, Button } from 'antd'
import { NavBar, Drawer } from 'antd-mobile'
import { MenuOutlined } from '@ant-design/icons'

import './navMenuStyles.less'

// This menu specific for create/new/import screens
const NavMenuSimple: React.FC = (): JSX.Element => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false)
  const handleChangeDrawer = () => {
    setDrawerIsOpen(!drawerIsOpen)
  }
  const handleMenuClick = () => {
    console.log('clicked the menu item...')
    setDrawerIsOpen(!drawerIsOpen)
  }
  return (<>

    <NavBar
      className="navbar-mobile"
      mode="dark"
      rightContent={[
        <Button size="large" key="0" onClick={handleChangeDrawer}>
          <MenuOutlined />
        </Button>
      ]}
    >
      <a className="navbar-brand text-uppercase font-size-h5" href={FlowRouter.path('home')}>
        <img src="/img/Asgard-Tri-White.png" className="float-left mr-2" width="28" height="28" alt="" />
        <strong className="font-brand">Asgard</strong><small className='text-color-secondary'>&nbsp;BETA</small>
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
      theme="dark"
    >
      <Menu.Item key="walletCreate">
        <a href="" onClick={() => FlowRouter.go('walletCreate')}>Create</a>
      </Menu.Item>
      <Menu.Item key="walletImport">
        <a href="" onClick={() => FlowRouter.go('walletImport')}>Import</a>
      </Menu.Item>
      <Menu.Item key="walletImportOptions">
        <a href="" onClick={() => FlowRouter.go('walletImportOptions')}>Options</a>
      </Menu.Item>
    </Menu>
  )
}