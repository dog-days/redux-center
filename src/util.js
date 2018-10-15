/**
 * 创建async 和 generator 版的dispatch
 * @param {funciton} dispatch
 */
export function createPut(dispatch) {
  /**
   * @param {object} aciton redux的action
   * @return {object} { put } async 和 generator 版的dispatch
   * await put(action)
   * yield put(action)
   */
  return function(action) {
    const put = new Promise(function(resolve) {
      resolve(dispatch(action));
    });
    return put;
  };
}
/**
 * 创建async 和 generator 版的getState
 * @param {funciton} getState
 */
export function createGetState(getState) {
  /**
   * @return {object} { put } async 和 generator 版的getState
   * await select()
   * yield select()
   */
  return function() {
    const select = new Promise(function(resolve) {
      resolve(getState());
    });
    return select;
  };
}
/**
 * call的调用promise，为了兼容以前dva、redux-saga-model的用法。
 */
export function call(fn, ...args) {
  function promise(...args) {
    return fn(...args);
  }
  return promise.call(null, ...args);
}
