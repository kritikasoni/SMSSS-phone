//refs: https://github.com/fbsamples/f8app/blob/master/js/store/promise.js
function warn(error) {
  console.warn(error.message || error);
  throw error; // To let the caller handle the rejection
}

const promiseMiddleware = store => next => action =>
  typeof action.then === 'function'
    ? Promise.resolve(action).then(next, warn)
    : next(action);

export default promiseMiddleware;
