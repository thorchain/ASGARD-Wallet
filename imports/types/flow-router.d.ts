// Type definitions for FlowRouter.
// Project: https://atmospherejs.com/kadira/flow-router
// Definitions:
// https://github.com/meteor-typings/flow-router/blob/master/main.d.ts
// Definitions by:
// <https://github.com/tomitrescak>

interface FlowRouterRouteParameters {
  name?: string;
  subscriptions?: Function;
  action?: Function;
  middlewares?: any[];
}

interface FlowRouterRoute {
  path: string;
  params: Object;
  queryParams: Object;
  route: { name: string };
  oldRoute: { name: string, group: {name: string}; }; // Added
}

interface FlowRouterGroupParams {
  prefix?: string;
  action?: Function;
  middlewares?: any[];
}

interface FlowRouterGroup {
  route(routeUrl: string, routeParameters: FlowRouterRouteParameters): void
}

interface FlowRouterStatic {
  route(routeUrl: string, routeParameters: FlowRouterRouteParameters): void
  notFound: FlowRouterRouteParameters
  path(routeName: string, routeParams?: Object, queryParams?: Object): string;
  getParam(paramName: string): string;
  getQueryParam(paramName: string): string;
  go(routeName: string, routeParams?: Object, queryParams?: Object): string;
  setParams(newParams: Object): void;
  setQueryParams(newParams: Object): void;
  getRouteName(): string;
  current(): FlowRouterRoute;
  watchPathChange(): void;
  group(params: FlowRouterGroupParams): FlowRouterGroup;
  subsReady(subscription?: string): boolean;
}

declare var FlowRouter: FlowRouterStatic;

interface FlowLayoutStatic {
  render(layoutName: string, templates: Object): void;
}

declare var FlowLayout: FlowLayoutStatic;

declare module 'meteor/kadira:flow-router' {
  export var FlowRouter: FlowRouterStatic;
}

// For backwards compatibility
declare module 'meteor/meteorhacks:flow-router' {
  export var FlowRouter: FlowRouterStatic;
}
