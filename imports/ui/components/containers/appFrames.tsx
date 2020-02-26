import React from 'react';

export class MainLayout extends React.Component<{
  header: React.Component,
  content: React.Component
}> {
  render() {
    return (
    <div>
      {this.props.header}
      <main id="app-wrapper" className="container-fluid">
        {this.props.content}
      </main>
      <footer>
      {/* This is where modal will go */}
      </footer>
    </div>
  )}
};

interface BareLayoutTypes { content() : React.Component }
export const BareLayout: React.SFC<BareLayoutTypes> = ({content}) => {
  return (
  <div>
    <main id="app-wrapper" className="container-fluid">
      {content()}
    </main>
    <footer>
    {/* This is where modal will go */}
    </footer>
  </div>
  )
}
// This has branding background
export class BareLayoutBranded extends React.Component<{
  header: React.Component,
  content: React.Component
}> {
  render() {
    return (
    <div>
      {this.props.header}
      <main id="app-wrapper" className="container-fluid bg-img-brand">
        {this.props.content}
      </main>
      <footer>
      {/* This is where modal will go */}
      </footer>
    </div>
    )
  }

}

interface WelcomeProps { name: string }
export const WelcomeComponent: React.SFC<WelcomeProps> = ({name}) => (<p>Hello, {name}</p>);