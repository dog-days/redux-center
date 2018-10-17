import { createStore, combineReducers, applyMiddleware } from 'redux';
import loggerMiddleware from 'redux-logger';
import createCenter from 'redux-center';
import combineCenters from 'redux-center/lib/combine-centers';

function counter(state = 0, { type, payload = {} }) {
  const { value } = payload;
  switch (type) {
    case 'INCREMENT':
      return state + value;
    case 'DECREMENT':
      return state - value;
    default:
      return state;
  }
}
const centers = [
  async function(action, { put, call, select }) {
    // console.log(action);
    switch (action.type) {
      case 'test':
        //下面append了一个center
        await put({ type: 'test2' });
        await put({
          type: 'INCREMENT',
          payload: {
            value: 1,
          },
        });
        console.log(
          'awiat before DECREMENT:',
          await select(state => state.counter)
        );
        await put({
          type: 'DECREMENT',
          payload: {
            value: 2,
          },
        });
        console.log(
          'await after DECREMENT:',
          await select(state => state.counter)
        );
        const data = await call(fetch, '/demo.json').then(resonse => {
          return resonse.json();
        });
        console.log('Fetched data:', data);
        break;
      case 'test3':
        // console.log('test3');
        break;
      default:
        return true;
    }
  },
];

const centerInstance = createCenter(combineCenters(centers));
const centerMiddleware = centerInstance.createCenterMiddleware();
const store = createStore(
  combineReducers({ counter }),
  applyMiddleware(centerMiddleware, loggerMiddleware)
);
let clearRenderTimeout;
store.subscribe(function() {
  // 避免dispath过于频繁。
  // 这样可以避免频繁渲染，集中一次渲染。
  clearTimeout(clearRenderTimeout);
  clearRenderTimeout = setTimeout(function() {
    document.getElementById('app').innerHTML = '请查看console';
    // console.log('render message');
  }, 200);
});
centerInstance.append(
  combineCenters(function*(action, { put, select }) {
    switch (action.type) {
      case 'test2':
        // console.log('test2');
        yield put({ type: 'test3' });
        break;
      default:
        return true;
    }
  })
);
// store.dispatch({ type: 'render' });
store.dispatch({ type: 'test' });
