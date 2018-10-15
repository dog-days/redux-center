# redux-center

`redux-center`是redux中间件，`redux-center`的思想源自`redux-saga`，旨在分离reducer的复杂计算逻辑。

## 为什么使用redux-center

因为redux中只要出发了`dispatch`（其他middleware没有拦截），所有reducer都会运行一遍，那么如果你的逻辑写在了switch逻辑外面就会造成多余运算。使用`redux-center`的可以减少重复计算，这个跟在reducer中使用`reselect`和不在react的render函数中做运算处理的目的是一样的。

## 概念

为了更好的统一，`redux-center`统一这种方式叫`中枢模式`。 

### 定义

`中枢模式`，所有的`dispatch`都必须经过`中枢`，符合规则，直接中枢拦截处理，`中枢`再进行其他`dispatch`，然后派遣数据到`reducer`或者其他`center`。

### 其他说明

`中枢模式`下`reducer`不建议进行数据处理和适配，`reducer`只处理简单数据合并，替换，删除等，不做遍历处理。

`中枢`异步请求数据、做数据适配等，复杂的数据处理应该让给它处理。`中枢模式`可以避免`reducer`中多次运行数据适配的问题。

## 安装

```sh
#因为是基于redux所以要安装redux
npm i redux redux-center
```

## 使用

`redux-center`支持`async`和`generator`使用方式。如果使用`generator`则需要使用`combineCenters`进行适配处理。

```js
import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import createCenter from 'redux-center';
import combineCenters from 'redux-center/lib/combine-centers';

function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
}
const centers = [
  async function(action, { put, call, select }) {
    switch (action.type) {
      case 'test':
        //下面append了一个center
        await put({ type: 'test2' });
        await put({ type: 'INCREMENT' });
        console.log(await select());
        await put({ type: 'DECREMENT' });
        console.log('counter', await select(state => state.counter));
        const data = await call(fetch, '/demo.json').then(resonse => {
          return resonse.json();
        });
        console.log(data);
        break;
      case 'test3':
        console.log('test3');
        break;
      default:
        return true;
    }
  },
];
const centerInstance = createCenter(combineCenters(centers));
const centerMiddleware = centerInstance.createCenterMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers({ counter }),
  composeEnhancers(applyMiddleware(centerMiddleware))
);
let clearRenderTimeout;
store.subscribe(function() {
  //避免dispath过于频繁。
  //这样可以避免频繁渲染，集中一次渲染。
  clearTimeout(clearRenderTimeout);
  clearRenderTimeout = setTimeout(function() {
    console.log('render message');
  }, 200);
});
centerInstance.append(
  combineCenters(function*(action, { put, select }) {
    switch (action.type) {
      case 'test2':
        console.log('test2');
        yield put({ type: 'test3' });
        break;
      default:
        return true;
    }
  })
);
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

| 对象值                 | 类型                    | 说明                                        |
| ---------------------- | ----------------------- | ------------------------------------------- |
| createCenterMiddleware | function                | 创建center的redux中间件                     |
| append                 | function(centers)       | 追加单个或者多个center                      |
| replaceCenters         | functon(replaceCenters) | 替换centers，用于热替换使用，需要整体替换。 |

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









