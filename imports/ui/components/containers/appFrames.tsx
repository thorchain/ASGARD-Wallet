import React from 'react';

type MainLayoutTypes = { header() : React.Component, content() : React.Component }
export const MainLayout: React.SFC<MainLayoutTypes> = ({header, content}): JSX.Element => {
    return (
    <div>
      {header()}
      <main id="app-wrapper" className="container-fluid">
        {content()}
      </main>
      <footer>
      {/* This is where modal will go */}
      </footer>
    </div>
  )
};

type BareLayoutBrandedTypes = {content() : React.Component }
export const BareLayoutBranded: React.SFC<BareLayoutBrandedTypes> = ({content}): JSX.Element => {
  return (
  <div>
    <main id="app-wrapper" className="container-fluid bg-img-brand">
      {content()}
    </main>
    <footer>
    {/* This is where modal will go */}
    </footer>
  </div>
  )
}
