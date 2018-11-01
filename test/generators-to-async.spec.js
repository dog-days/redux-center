import generatorsToAsync from '../src/generators-to-async';

describe('generators-to-async', () => {
  const RESULT = { type: '@@test' };
  const generators = [
    function*() {
      return yield new Promise(resolve => {
        resolve(RESULT);
      });
    },
  ];
  it('should work with param which type is funciton', done => {
    const asyncs = generatorsToAsync(generators[0]);
    asyncs.should.be.an('array');
    asyncs[0]().should.be.a('promise');
    asyncs[0]().then(re => {
      re.should.equal(RESULT);
      done();
    });
  });
  it('should work with param which type is array', done => {
    const asyncs = generatorsToAsync(generators);
    asyncs.should.be.an('array');
    asyncs[0]().should.be.a('promise');
    asyncs[0]().then(re => {
      re.should.equal(RESULT);
      done();
    });
  });
  it('should work with param which type is not a function or an array.', () => {
    // generatorsToAsync().should.be.undefined 会报错的
    // eslint-disable-next-line
    should.equal(generatorsToAsync(), undefined);
    generatorsToAsync('dd').should.deep.equal([undefined]);
    generatorsToAsync({}).should.deep.equal([undefined]);
    generatorsToAsync(0).should.deep.equal([undefined]);
  });
  it('should work with param which value is ["a",undefined,{},0]', () => {
    //测试数组成员非函数的情况
    const asyncs = generatorsToAsync(['a', undefined, {}, 0]);
    // eslint-disable-next-line
    should.equal(asyncs[0], undefined);
    // eslint-disable-next-line
    should.equal(asyncs[1], undefined);
    // eslint-disable-next-line
    should.equal(asyncs[2], undefined);
    // eslint-disable-next-line
    should.equal(asyncs[3], undefined);
  });
});
