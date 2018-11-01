import createCenter from '../src/index';

describe('center middleware', () => {
  const doDispatch = () => {};
  const doGetState = () => {};
  const centerInstance = createCenter([]);
  const centerMiddleware = centerInstance.createCenterMiddleware();
  const nextHandler = centerMiddleware({
    dispatch: doDispatch,
    getState: doGetState,
  });

  it('must return a function to handle next', () => {
    nextHandler.should.be.a('function');
    nextHandler.length.should.equal(1);
  });

  describe('handle next', () => {
    it('must return a function to handle action', () => {
      const actionHandler = nextHandler();
      actionHandler.should.be.a('function');
      actionHandler.length.should.equal(1);
    });
    describe('handle action', () => {
      const actionObj = {
        type: '@@test',
      };
      it('must return a promise after passing action to next', () => {
        const actionHandler = nextHandler(action => {
          /*noop*/
        });
        actionHandler().should.be.a('promise');
      });
      it('must resovle action by promise', done => {
        //actionHandler相当于dispatch
        const actionHandler = nextHandler(action => {
          return action;
        });
        const resultPromise = actionHandler(actionObj);
        resultPromise.then(action => {
          action.should.equal(actionObj);
          done();
        });
      });
    });
  });
  describe('handle errors', () => {
    it('must throw if argument is non-object', done => {
      try {
        centerMiddleware();
      } catch (err) {
        done();
      }
    });
  });
});
