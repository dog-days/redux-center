import { createStore, applyMiddleware } from 'redux';
import sinon from 'sinon';

import createCenter from '../../src/index';
import { counterReducer } from './reducers';

//begin----sinon.spy
const counterReducerSpy = sinon.spy(counterReducer);
const incrementAsyncSpy = sinon.spy(async function(action, { put, delay }) {
  switch (action.type) {
    case 'INCREMENT_ASYNC':
      await put({ type: 'INCREMENT' });
      break;
    default:
      // shouldRunReducer=false，默认必须返回true。
      //返回true才会执行next，然后执行reducer
      return true;
  }
});
//end  ----sinon.spy

const centerInstance = createCenter(incrementAsyncSpy, {
  shouldRunReducer: false,
});
const centerMiddleware = centerInstance.createCenterMiddleware();
const store = createStore(counterReducerSpy, applyMiddleware(centerMiddleware));

describe('custom options of center middleware', function() {
  it('should work correctly with center when options.shouldRunReducer = false', done => {
    //默认设置只要dispatch就会运行center和reducer
    const prevCounterReducerCallCount = counterReducerSpy.callCount;
    const prevIncrementAsyncCallCount = incrementAsyncSpy.callCount;
    const unsubscribe = store.subscribe(() => {
      //默认设置，dispatch到center也会触发subscribe的
      //只要dispatch就会运行reducer，center默认是不做拦截，即使没有命中center的运行条件。
      // dispatch({ type: "INCREMENT_ASYNC" }) 还有触发put({ type: "INCREMENT" })
      //总共是两次
      counterReducerSpy.callCount.should.equal(prevCounterReducerCallCount + 1);
      incrementAsyncSpy.callCount.should.equal(prevIncrementAsyncCallCount + 2);
      unsubscribe();
      done();
    });
    store.dispatch({ type: 'INCREMENT_ASYNC' });
  });
});
