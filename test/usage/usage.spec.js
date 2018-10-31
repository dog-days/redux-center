import { createStore, applyMiddleware } from 'redux';
import sinon from 'sinon';

import createCenter from '../../src/index';
import { counterReducer } from './reducers';
import { incrementAsync } from './centers';

//begin----sinon.spy
const counterReducerSpy = sinon.spy(counterReducer);
const incrementAsyncSpy = sinon.spy(incrementAsync);
//end  ----sinon.spy

const centerInstance = createCenter(incrementAsyncSpy);
const centerMiddleware = centerInstance.createCenterMiddleware();
const store = createStore(counterReducerSpy, applyMiddleware(centerMiddleware));

const dispatchAction = type => store.dispatch({ type });

describe('usage of center middleware', function() {
  it('should not be missing the api of `createCenter()`', () => {
    // eslint-disable-next-line
    (!!centerInstance.append).should.be.true;
    // eslint-disable-next-line
    (!!centerInstance.replaceCenters).should.be.true;
  });
  let oldTime;
  let newTime;
  it('should work correctly with center', function(done) {
    let prevCallCount = counterReducerSpy.callCount;
    oldTime = +new Date();
    dispatchAction('INCREMENT_ASYNC');
    store.subscribe(() => {
      newTime = +new Date();
      //只要dispatch就会运行reducer，center默认是不做拦截，即使没有命中center的运行条件。
      // dispatch({ type: "INCREMENT_ASYNC" }) 还好触发put({ type: "INCREMENT" })
      //总共是两次
      counterReducerSpy.callCount.should.equal(prevCallCount + 2);
      done();
    });
  });
  it('should be delayed when dipatching `INCREMENT_ASYNC`.', () => {
    const countTimes = newTime - oldTime;
    //center中，延时了1000ms
    countTimes.should.above(1000);
  });
});
