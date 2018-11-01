import { createPut, createGetState, call, delay } from '../src/util';

describe('util', () => {
  const dispatch = action => action;
  const getState = () => {
    return { counter: 10 };
  };
  it('should work with `createPut`', done => {
    const action = { type: '@test' };
    createPut(dispatch)(action).then(result => {
      result.should.deep.equal(action);
      done();
    });
  });
  it('should work with `createGetState` normaly', done => {
    createGetState(getState)().then(state => {
      state.should.deep.equal(getState());
      done();
    });
  });
  it('should work with `createGetState` after using selector param.', done => {
    createGetState(getState)(state => state.counter).then(counter => {
      counter.should.equal(getState().counter);
      done();
    });
  });

  it('should work with `call`', () => {
    function tester(a, b) {
      return a + b;
    }
    call(tester, 1, 3).should.equal(tester(1, 3));
  });
  it('should work with `delay`', () => {
    const oldTime = +new Date();
    delay(200).then(delayTime => {
      const newTime = +new Date();
      const spendTime = newTime - oldTime;
      spendTime.should.above(delayTime);
    });
  });
});
