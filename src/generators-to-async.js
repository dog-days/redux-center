import co from 'co';

/**
 * async运行后返回的是promise对象，generator转async,
 * 其实即使转成promise，其中需要用到co generator执行器,
 * 如果不是generator不做处理，co类库自身做了处理。
 * @param {function} generatorFunction generator 函数
 * @return {function | undefined} 返回转换后的函数或者undefined（当generator不是函数是，返回undefined）
 */
export function generatorToAsync(generatorFunction) {
  if (typeof generatorFunction !== 'function') {
    return;
  }
  return function(...args) {
    return co(generatorFunction(...args));
  };
}
/**
 * 多个generators函数转成async
 * @param {function | array} generators
 * @return {array | undefined} promise数组，generators未定义返回undefined
 */
export default function generatorsToAsync(generators) {
  if (generators === undefined) {
    return undefined;
  }
  if (!Array.isArray(generators)) {
    generators = [generators];
  }
  return generators.map(function(generatorFunction) {
    return generatorToAsync(generatorFunction);
  });
}
