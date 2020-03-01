import React from 'react'

const BreadCrumb: React.FC = () => {
  const goBack = () => {
    // window.history.back
    const prevRoute = FlowRouter.current()
    console.log(prevRoute)
  }
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcumb">
        <li className="breadcrumb-item"><a href="" onClick={goBack}><i className="fa fa-chevron-left"></i> Back</a></li>
      </ol>
    </nav>
  )
}
export default BreadCrumb
