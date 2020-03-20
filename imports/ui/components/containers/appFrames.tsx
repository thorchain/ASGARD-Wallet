import React from 'react';
import NavBreadcrumb from '/imports/ui/components/elements/breadcrumb'

type MainLayoutProps = { header() : React.Component, content() : React.Component }
export const MainLayout: React.FC<MainLayoutProps> = ({header, content}): JSX.Element => {
  return (
    <div id="app-wrapper">
      {header()}
      <main className="container-fluid">
        <NavBreadcrumb/>
        {content()}
      </main>
      <footer>
      {/* This is where modal will go */}
      </footer>
    </div>
  )
};
type BareLayoutProps = { header?(): React.Component, content() : React.Component}
export const BareLayout: React.FC<BareLayoutProps> = ({header, content}) => {
  return (
    <div id="app-wrapper">
      {header && header()}
      <main className="container-fluid">
        {content()}
      </main>
      <footer>
      {/* This is where modal will go */}
      </footer>
    </div>
  )
}
type BareLayoutBrandedProps = {content() : React.Component }
export const BareLayoutBranded: React.FC<BareLayoutBrandedProps> = ({content}): JSX.Element => {
  return (
    <div id="app-wrapper" className="bg-img-brand">
      <main className="container-fluid">
        {content()}
      </main>
      <footer>
      {/* This is where modal will go */}
      </footer>
    </div>
  )
}
