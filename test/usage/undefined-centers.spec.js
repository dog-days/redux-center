import { createStore, applyMiddleware } from 'redux';
import { counterReducer } from './reducers';

import createCenter from '../../src/index';

const centerInstance = createCenter(undefined);
const centerMiddleware = centerInstance.createCenterMiddleware();
const store = createStore(counterReducer, applyMiddleware(centerMiddleware));

describe('undefined centers', () => {
  it('should not throw error.', done => {
    try {
      store.dispatch({ type: '@@test' });
    } catch (e) {
      /*noop*/
    } finally {
      done();
    }
  });
});
