# redux-center

[![build status](https://travis-ci.org/dog-days/redux-center.svg?branch=master)](https://travis-ci.org/dog-days/redux-center) [![codecov](https://codecov.io/gh/dog-days/redux-center/branch/master/graph/badge.svg)](https://codecov.io/gh/dog-days/redux-center) [![npm package](https://badge.fury.io/js/redux-center.svg)](https://www.npmjs.org/package/redux-center) [![NPM downloads](http://img.shields.io/npm/dm/redux-center.svg)](https://npmjs.org/package/redux-center)

`redux-center`是 redux 异步操作中间件，`redux-center`可以简单理解为`redux-thunk`的升级版，进行了用法规范，可以作为`redux-thunk`、`redux-saga`、`redux-promise`等的替代品。

`redux-center`多了一层`center`，`center`层将业务代码分离出 `action` 层和 `reducer` 层，减少了代码耦合，对于后期维护和测试非常有益。

`redux-center`目前应用于[redux-mutation](https://github.com/dog-days/redux-center)。

## 浏览器兼容性

兼容 IE9、edge、谷歌、火狐、safar 等浏览器，其中 IE 需要而外支持`promise`。

首先安装 promise

```sh
npm i promise
```

然后添加下面代码

```js
if (typeof Promise === 'undefined') {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  require('promise/lib/rejection-tracking').enable();
  window.Promise = require('promise/lib/es6-extensions.js');
}
```

## 安装

```sh
#因为是基于redux所以要安装redux
npm i redux redux-center
```

## 简单使用

`redux-center`支持`async`和`generator`使用方式。如果使用`generator`则需要使用`generatorsToAsync`进行适配处理。

```js
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createCenter from 'redux-center';
import generatorsToAsync from 'redux-center/lib/generators-to-async';

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
    switch (action.type) {
      case 'INCREMENT_ASYNC':
        await put({ type: 'INCREMENT' });
      default:
    }
  },
];

const centerInstance = createCenter(combineCenters(centers));
const centerMiddleware = centerInstance.createCenterMiddleware();
const store = createStore(
  combineReducers({ counter }),
  applyMiddleware(centerMiddleware)
);
let clearRenderTimeout;
store.subscribe(function() {
  console.log('counter:', store.getState());
});

// store.dispatch({ type: 'render' });
store.dispatch({ type: 'INCREMENT_ASYNC' });
```

更多使用情况`./examples`文件夹下的例子。

## 使用注意

`center`的用法跟`reducer`很像，所以`center`的执行不能跟`reucer`冲突，例如下面就是不合理的：

```js
//伪代码
//reducer
function couter(state, action) {
  switch (action.type) {
    case 'same-action-type':
      break;
    default:
      return state;
  }
}
//centers
[
  function(state, action) {
    switch (action.type) {
      case 'same-action-type':
        break;
      default:
        return state;
    }
  },
];
```

上面两个`case 'same-action-type'`都会执行，因为执行`center`也会执行`reducer`。

`redux-mutation`基于`redux-center`但是没有这个问题，因为`redux-center`定义了新结构，把`switch case`的条件转换成了函数名，然后就可以和`reducers`做对比了。

## 文档

- [API 文档](./API.md)

## 在浏览器中使用 umd 方式

有两种方式，第一种是使用 cdn，第二种就是直接在打包后的的`./dist`文件中获取。

### cdn 方式

- https://unpkg.com/redux-center/dist/redux-center.js
- https://unpkg.com/redux-center/dist/redux-center.min.js
- https://unpkg.com/redux-center/dist/generators-to-async.js
- https://unpkg.com/redux-center/dist/generators-to-async.min.js

### 构建方式

```sh
git clone https://github.com/dog-days/redux-center
cd redux-center
npm install
npm test
npm run build
```

然后在根目录下的`./dist`文件夹获取相关的 js 文件。

## 基于源文件运行例子

请看[这里](./examples)。
