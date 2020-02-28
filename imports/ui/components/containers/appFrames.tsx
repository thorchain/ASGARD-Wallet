import React from 'react';

interface MainLayoutTypes { header() : React.Component, content() : React.Component }
export const MainLayout: React.SFC<MainLayoutTypes> = ({header, content}) => {
// export class MainLayout extends React.Component<{
//   header: React.Component,
//   content: React.Component
// }> {
  // render() {
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
// }
};

interface BareLayoutTypes { header() : React.Component, content() : React.Component }
export const BareLayout: React.SFC<BareLayoutTypes> = ({header, content}) => {
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
}

interface BareLayoutBrandedTypes {content() : React.Component }
export const BareLayoutBranded: React.SFC<BareLayoutBrandedTypes> = ({content}) => {
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

// export class BareLayoutBrandedX extends React.Component<{
//   header: React.Component,
//   content: React.Component
// }> {
//   render() {
//     return (
//     <div>
//       {this.props.header}
//       <main id="app-wrapper" className="container-fluid bg-img-brand">
//         {this.props.content}
//       </main>
//       <footer>
//       {/* This is where modal will go */}
//       </footer>
//     </div>
//     )
//   }

// }
