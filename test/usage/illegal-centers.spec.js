import { createStore, applyMiddleware } from 'redux';
import { counterReducer } from './reducers';
import { incrementAsync } from './centers';

import createCenter from '../../src/index';

const centerInstance = createCenter([incrementAsync, 'ddd']);
const centerMiddleware = centerInstance.createCenterMiddleware();
const store = createStore(counterReducer, applyMiddleware(centerMiddleware));

describe('undefined centers', () => {
  it('should throw error.', done => {
    try {
      store.dispatch({ type: '@@test' });
    } catch (e) {
      done();
    }
  });
});
