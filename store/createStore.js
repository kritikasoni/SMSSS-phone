import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import makeRootReducer from '../reducers';
import createLogger from 'redux-logger';
import promiseMiddleware from './promiseMiddleware';
export default (initialState = {}) => {

  // ======================================================
  // Middleware Configuration
  // ======================================================
  const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;

  const logger = createLogger({
    predicate: (getState, action) => isDebuggingInChrome,
    collapsed: true,
    duration: true,
  });

  const middleware = [thunk, promiseMiddleware, logger ];

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = createStore(
    makeRootReducer(),
    initialState,
    compose(
      applyMiddleware(...middleware)
    )
  );

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const reducers = require('./../reducers').default;
      store.replaceReducer(reducers);
    });
  }
  return store;
};
