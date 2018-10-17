import { call, createPut, createGetState } from './util';

export default function createCenter(centers) {
  if (centers === undefined) {
    //默认值
    centers = async function() {
      return true;
    };
  }
  if (!Array.isArray(centers)) {
    //先统一处理成数组
    centers = [centers];
  }
  /**
   * redux-center是redux异步操作中间件，
   * redux-center可以简单理解为redux-thunk的升级版，进行了用法规范，
   * 可以作为redux-thunk、redux-saga、redux-promise等的替代品。
   * @param {async function || ...async function} centers center函数或者center数组函数（async函数），
   * 用法跟reducer差不多，函数参数不一样，例如：
   * function async centers(action,{ put, call, selector, dispatch, getState }){
   *   //put,call,selector跟redux-saga用法一致
   *   //put是promise版的dispatch,
   *   //call是执行promise
   *   //同时保留了原有的dispatch和getState
   *   switch(action.type){
   *     case "test":
   *       const data = await call(fetch,'/api/data');
   *       await put({ type: 'test',payload: data });
   *     break;
   *     default:
   *   }
   * }
   * 如果返回true，就会正常运行原来的dispatch
   * @function createCenterMiddleware 创建centerMiddleware
   * @function append 追加单个或者多个center
   * @function repalceCenters 替换centers，用于热替换使用，需要整体替换。
   * @return {object} createCenter
   */
  class Center {
    /**
     * 创建centerMiddleware
     */
    createCenterMiddleware() {
      return ({ dispatch, getState }) => next => async action => {
        const result = next(action);
        const promises = centers.map(function(center) {
          //center的元素必须是函数。
          if (typeof center !== 'function') {
            throw new TypeError('Expected the center to be a function.');
          } else {
            return center(action, {
              put: createPut(dispatch),
              select: createGetState(getState),
              call,
              dispatch,
              getState,
            });
          }
        });
        await Promise.all(promises);
        return result;
      };
    }
    /**
     * 追加单个或者多个center
     * @param {function || ...function} 追加的center
     */
    append(center) {
      if (Array.isArray(center)) {
        Array.prototype.push.apply(centers, center);
      } else {
        this.centers.push(center);
      }
    }
    /**
     * 替换centers，用于热替换或者动态加载，需要整体替换。
     * @param {...function} 将要替换的centers
     */
    replaceCenters(replaceCenters) {
      if (!Array.isArray(replaceCenters)) {
        throw new Error('Expected the replaceCenters to be an array.');
      }
      centers = replaceCenters;
    }
  }
  return new Center(centers);
}
