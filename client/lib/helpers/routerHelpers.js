/*
 * Flow Router Helpers
 * Orginally from: https://github.com/arillo/meteor-flow-router-helpers
 * Conversion from coffeescript because of broken dependency on older version
 *
 */
 
// check for subscriptions to be ready
const subsReady = function(...subs) {
  if (subs.length === 1) { return FlowRouter.subsReady(); }
  subs = subs.slice(0, subs.length - 1);
  return _.reduce(subs, (memo, sub) => memo && FlowRouter.subsReady(sub)
  , true);
};

// return path
const pathFor = function(path, view) {
  if (view == null) { view = {hash:{}}; }
  if (!path) { throw new Error('no path defined'); }
  // set if run on server
  if (!view.hash) { view = {hash: view}; }
  if ((path.hash != null ? path.hash.route : undefined) != null) {
    view = path;
    path = view.hash.route;
    delete view.hash.route;
  }
  const query = view.hash.query ? FlowRouter._qs.parse(view.hash.query) : {};
  const hashBang = view.hash.hash ? view.hash.hash : '';
  return FlowRouter.path(path, view.hash, query) + (hashBang ? `#${hashBang}` : '');
};

// return absolute url
const urlFor = function(path, view) {
  const relativePath = pathFor(path, view);
  return Meteor.absoluteUrl(relativePath.substr(1));
};

// get parameter
const param = name => FlowRouter.getParam(name);

// get query parameter
const queryParam = key => FlowRouter.getQueryParam(key);

// get current route name
const currentRouteName = () => FlowRouter.getRouteName();

// get current route options
const currentRouteOption = optionName => FlowRouter.current().route.options[optionName];

// deprecated
const isSubReady = function(sub) {
  if (sub) { return FlowRouter.subsReady(sub); }
  return FlowRouter.subsReady();
};

const helpers = {
  subsReady,
  pathFor,
  urlFor,
  param,
  queryParam,
  currentRouteName,
  isSubReady,
  currentRouteOption
};

if (Meteor.isClient) {
  for (let name of Object.keys(helpers || {})) { const func = helpers[name]; Template.registerHelper(name, func); }
}
  
FlowRouterHelpers = { 
  pathFor,
  urlFor
};

