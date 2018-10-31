import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import loggerMiddleware from 'redux-logger';
import createCenter from 'redux-center';

import Counter from './Counter';

function counterReducer(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'INCREMENT_IF_ODD':
      return state % 2 !== 0 ? state + 1 : state;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
}
async function incrementAsync(action, { put, delay }) {
  switch (action.type) {
    case 'INCREMENT_ASYNC':
      await delay(1000);
      await put({ type: 'INCREMENT' });
      break;
    default:
  }
}
const centers = [incrementAsync];

const centerInstance = createCenter(centers);
const centerMiddleware = centerInstance.createCenterMiddleware();
const store = createStore(
  counterReducer,
  applyMiddleware(centerMiddleware, loggerMiddleware)
);

const dispatchAction = type => store.dispatch({ type });

function render() {
  ReactDOM.render(
    <Counter
      value={store.getState()}
      onIncrement={() => dispatchAction('INCREMENT')}
      onDecrement={() => dispatchAction('DECREMENT')}
      onIncrementIfOdd={() => dispatchAction('INCREMENT_IF_ODD')}
      onIncrementAsync={() => dispatchAction('INCREMENT_ASYNC')}
    />,
    document.getElementById('root')
  );
}

render();
store.subscribe(render);
