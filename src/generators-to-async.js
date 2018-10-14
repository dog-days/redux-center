import co from 'co';

/**
 * async运行后返回的是promise对象，generator转async,
 * 其实即使转成promise，其中需要用到co generator执行器,
 * 如果不是generator不做处理，co类库自身做了处理。
 * @param {function} generatorFunction generator 函数
 * @param {...any} args generatorFunction的参数
 */
export function generatorToAsync(generatorFunction) {
  if (typeof generatorFunction !== 'function') {
    console.warn('generator must be an function.');
    return function() {
      /**noop**/
    };
  }
  return function(...args) {
    return co(generatorFunction(...args));
  };
}
/**
 * 多个generators函数转成async
 * @param {function || ...funcion} generators
 */
export default function generatorsToAsync(generators) {
  if (!Array.isArray(generators)) {
    generators = [generators];
  }
  return generators.map(function(generatorFunction) {
    return generatorToAsync(generatorFunction);
  });
}
