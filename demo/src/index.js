import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import createCenter from 'redux-center';
import combineCenters from 'redux-center/lib/combine-centers';

function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
}
const centers = [
  async function(action, { put, call, select }) {
    switch (action.type) {
      case 'test':
        //下面append了一个center
        await put({ type: 'test2' });
        await put({ type: 'INCREMENT' });
        console.log(await select());
        await put({ type: 'DECREMENT' });
        console.log('counter', await select(state => state.counter));
        const data = await call(fetch, '/demo.json').then(resonse => {
          return resonse.json();
        });
        console.log(data);
        break;
      case 'test3':
        console.log('test3');
        break;
      default:
        return true;
    }
  },
];
const centerInstance = createCenter(combineCenters(centers));
const centerMiddleware = centerInstance.createCenterMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers({ counter }),
  composeEnhancers(applyMiddleware(centerMiddleware))
);
let clearRenderTimeout;
store.subscribe(function() {
  //避免dispath过于频繁。
  //这样可以避免频繁渲染，集中一次渲染。
  clearTimeout(clearRenderTimeout);
  clearRenderTimeout = setTimeout(function() {
    console.log('render message');
  }, 200);
});
centerInstance.append(
  combineCenters(function*(action, { put, select }) {
    switch (action.type) {
      case 'test2':
        console.log('test2');
        yield put({ type: 'test3' });
        break;
      default:
        return true;
    }
  })
);
// store.dispatch({ type: 'render' });
store.dispatch({ type: 'test' });
