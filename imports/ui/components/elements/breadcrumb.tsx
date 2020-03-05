import React from 'react'
import './breadcrumbStyles.scss'

const Breadcrumb: React.FC = (): JSX.Element => {
  const goBack = () => {
    const current = FlowRouter.current()
    if (current.oldRoute && current.oldRoute.group && current.oldRoute.group.name === 'walletRoutes') {
      window.history.back()
    }
  }
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcumb list-unstyled position-absolute m-0 p-0" style={{zIndex: 900}}>
        <li className="breadcrumb-item"><a href="" onClick={goBack}><i className="fa fa-chevron-left"></i> Back</a></li>
      </ol>
    </nav>
  )
}
export default Breadcrumb
