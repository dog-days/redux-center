import { createStore, applyMiddleware } from 'redux';
import sinon from 'sinon';

import createCenter from '../../src/index';
import { counterReducer } from './reducers';
import { incrementAsync, delayTime } from './centers';

//begin----sinon.spy
const counterReducerSpy = sinon.spy(counterReducer);
const incrementAsyncSpy = sinon.spy(incrementAsync);
//end  ----sinon.spy

const centerInstance = createCenter(incrementAsyncSpy);
const centerMiddleware = centerInstance.createCenterMiddleware();
const store = createStore(counterReducerSpy, applyMiddleware(centerMiddleware));

describe('default options of center middleware', function() {
  it('should not be missing the api of `createCenter()`', () => {
    // eslint-disable-next-line
    (!!centerInstance.append).should.be.true;
    // eslint-disable-next-line
    (!!centerInstance.replaceCenters).should.be.true;
  });
  it('should work correctly with center', done => {
    //默认设置只要dispatch就会运行center和reducer
    const prevCounterReducerCallCount = counterReducerSpy.callCount;
    const prevIncrementAsyncCallCount = incrementAsyncSpy.callCount;
    let clearSetTimeout;
    const unsubscribe = store.subscribe(() => {
      //默认设置，dispatch到center也会触发subscribe的
      clearTimeout(clearSetTimeout);
      clearSetTimeout = setTimeout(() => {
        //只要dispatch就会运行reducer，center默认是不做拦截，即使没有命中center的运行条件。
        // dispatch({ type: "INCREMENT_ASYNC" }) 还有触发put({ type: "INCREMENT" })
        //总共是两次
        counterReducerSpy.callCount.should.equal(
          prevCounterReducerCallCount + 2
        );
        incrementAsyncSpy.callCount.should.equal(
          prevIncrementAsyncCallCount + 2
        );
        unsubscribe();
        done();
      }, delayTime + 50);
    });
    store.dispatch({ type: 'INCREMENT_ASYNC' });
  });
  it('should work with the append of `createCenter()`', done => {
    const actionOne = { type: 'APPEND_ONE_ASYNC' };
    const spyOne = sinon.spy();
    const centerFunction = spyOne;
    const spyTwo = sinon.spy();
    const centerArray = [spyTwo];
    //参数是function
    centerInstance.append(centerFunction);
    //参数是array
    centerInstance.append(centerArray);
    const unsubscribe = store.subscribe(() => {
      const prevIncrementAsyncCallCount = incrementAsyncSpy.callCount;
      //redux-center的中间件，next默认执行在center之前，需要使用setTimeout进入列队等待执行
      //才会在center执行完，才执行。
      setTimeout(() => {
        // eslint-disable-next-line
        spyOne.withArgs(actionOne).calledOnce.should.be.true;
        // eslint-disable-next-line
        spyTwo.withArgs(actionOne).calledOnce.should.be.true;
        //只要dispatch，所有center都会执行。
        incrementAsyncSpy.callCount.should.equal(
          prevIncrementAsyncCallCount + 1
        );
        unsubscribe();
        done();
      });
    });
    store.dispatch(actionOne);
  });
  it('should work with the replaceCenters of `createCenter()`', done => {
    const actionOne = { type: 'REPLACE_ONE_ASYNC' };
    const spyOne = sinon.spy();
    const centerFunction = spyOne;
    const spyTwo = sinon.spy();
    const centerArray = [spyOne, spyTwo];
    //参数是function
    centerInstance.replaceCenters(centerFunction);
    //参数是array
    //centerFunction会被替换掉
    centerInstance.replaceCenters(centerArray);
    const unsubscribe = store.subscribe(() => {
      const prevIncrementAsyncCallCount = incrementAsyncSpy.callCount;
      //redux-center的中间件，next默认执行在center之前，需要使用setTimeout进入列队等待执行
      //才会在center执行完，才执行。
      setTimeout(() => {
        // eslint-disable-next-line
        spyOne.withArgs(actionOne).calledOnce.should.be.true;
        // eslint-disable-next-line
        spyTwo.withArgs(actionOne).calledOnce.should.be.true;
        //incrementAsync cneter已经被替换了，callCount不会变化
        prevIncrementAsyncCallCount.should.equal(incrementAsyncSpy.callCount);
        unsubscribe();
        done();
      });
    });
    store.dispatch(actionOne);
  });
});
