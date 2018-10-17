# redux-center

`redux-center`是redux异步操作中间件，`redux-center`可以简单理解为`redux-thunk`的升级版，进行了用法规范，可以作为`redux-thunk`、`redux-saga`、`redux-promise`等的替代品。

`redux-center`目前应用于[redux-mutation](https://github.com/dog-days/redux-center)。

## 概念

为了更好的统一，`redux-center`统一这种方式叫`中枢模式`。 

### 定义

`中枢模式`，所有的`dispatch`都必须经过`中枢`，符合规则，直接在`中枢`拦截处理，`中枢`再进行其他`dispatch`，然后派遣数据到`reducer`或者其他`center`。

## 安装

```sh
#因为是基于redux所以要安装redux
npm i redux redux-center
```

## 使用

`redux-center`支持`async`和`generator`使用方式。如果使用`generator`则需要使用`combineCenters`进行适配处理。

```js
import { createStore, combineReducers, applyMiddleware } from 'redux';
import loggerMiddleware from 'redux-logger';
import createCenter from 'redux-center';
import combineCenters from 'redux-center/lib/combine-centers';

function counter(state = 0, { type, payload = {} }) {
  const { value } = payload;
  switch (type) {
    case 'INCREMENT':
      return state + value;
    case 'DECREMENT':
      return state - value;
    default:
      return state;
  }
}
const centers = [
  async function(action, { put, call, select }) {
    console.log(action);
    switch (action.type) {
      case 'test':
        //下面append了一个center
        await put({ type: 'test2' });
        await put({
          type: 'INCREMENT',
          payload: {
            value: 1,
          },
        });
        console.log(
          'awiat before DECREMENT:',
          await select(state => state.counter)
        );
        await put({
          type: 'DECREMENT',
          payload: {
            value: 2,
          },
        });
        console.log(
          'await after DECREMENT:',
          await select(state => state.counter)
        );
        const data = await call(fetch, '/demo.json').then(resonse => {
          return resonse.json();
        });
        console.log('Fetched data:', data);
        break;
      case 'test3':
        // console.log('test3');
        break;
      default:
        return true;
    }
  },
];

const centerInstance = createCenter(combineCenters(centers));
const centerMiddleware = centerInstance.createCenterMiddleware();
const store = createStore(
  combineReducers({ counter }),
  applyMiddleware(centerMiddleware, loggerMiddleware)
);
let clearRenderTimeout;
store.subscribe(function() {
  // 避免dispath过于频繁。
  // 这样可以避免频繁渲染，集中一次渲染。
  clearTimeout(clearRenderTimeout);
  clearRenderTimeout = setTimeout(function() {
    document.getElementById('app').innerHTML = '请查看console';
    // console.log('render message');
  }, 200);
});
centerInstance.append(
  combineCenters(function*(action, { put, select }) {
    switch (action.type) {
      case 'test2':
        // console.log('test2');
        yield put({ type: 'test3' });
        break;
      default:
        return true;
    }
  })
);
// store.dispatch({ type: 'render' });
store.dispatch({ type: 'test' });
```

## API

```js
import createCenter from 'redux-center';
import combineCenters from 'redux-center/lib/combine-centers';
```

### createCenter

创建center

```js
function(value) => {createCenterMiddleware，append,replaceCenters}
```

使用例子

```js
import createCenter from 'redux-center';
const centerInstance = createCenter(centers);
```

#### 参数

| 参数    | 类型                                  | 说明                                                         |
| ------- | ------------------------------------- | ------------------------------------------------------------ |
| centers | async function<br />...async function | `center`函数或者`center`数组函数<br />使用`generator`函数时，需要使用`combineCenters` |

#### 返回值

返回一个对象。

| 对象值                 | 类型                    | 说明                                                    |
| ---------------------- | ----------------------- | ------------------------------------------------------- |
| createCenterMiddleware | function                | 创建center的redux中间件                                 |
| append                 | function(centers)       | 追加单个或者多个center                                  |
| replaceCenters         | functon(replaceCenters) | 替换centers，用于热替换和动态加载，<br />需要整体替换。 |

### combineCenters

在使用`generator`的情况下需要使用`combineCenters`，会把`generator`转换成`async`。

```js
function(generators) => ...function
```

使用例子

```js
import createCenter from 'redux-center';
import combineCenters from 'redux-center/lib/combine-centers';

const centerInstance = createCenter(combineCenters(centers));
```

#### 参数

| 参数       | 类型        | 说明     |
| ---------- | ----------- | -------- |
| generators | ...function | 数组函数 |









