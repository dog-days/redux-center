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
   * `中枢`控制方式，所有的dispatch都必须经过`中枢`,符合中枢规则，直接中枢拦截处理，
   * `中枢`再进行派遣决定，然后派遣数据到reducer。
   * `中枢`模式下reducer不建议进行数据处理和适配，
   * reducer只处理简单数据合并，替换，删除等，不做遍历处理。
   * `中枢`做数据适配，如遍历处理等，可以简单理解为`中枢`是事务处理中心，复杂的数据处理应该让给它处理。
   * `中枢`模式可以避免reducer中多次运行数据适配的问题，这个跟react render中不要进行数据适配是一样道理的。
   * render会多次运行，reducer函数也一，因为有默认state，只要dispatch(action)运行到reducer，
   * 就一定会运行所有reducer，当然dispatch不能被中间件拦截，如本项目`redux-center`。
   * `中枢模式`适合用于异步拉去数据。
   * @param {async function || ...async function} centers center函数或者center数组函数（async函数），
   * 用法跟reducer差不多，差别有两点： 函数参数不一样，return只能返回false或者true或者undefined，看下面例子
   * function async centers(action,{ put, call, selector, dispatch, getState }){
   *   //put,call,selector跟redux-saga用法一致
   *   //put是promise版的dispatch,
   *   //call是执行promise
   *   //同时保留了原有的dispatch和getState
   *   switch(action.type){
   *     case "test":
   *       const data = await call(fetch,'/api/data');
   *       await put({ type: 'test',payload: data });
   *       //这里不能return true
   *       //这里不return就一定没问题
   *     break;
   *     default:
   *       //这里一定要return true
   *       return true;
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
