# redux-center

`redux-center`是redux异步操作中间件，`redux-center`可以简单理解为`redux-thunk`的升级版，进行了用法规范，可以作为`redux-thunk`、`redux-saga`、`redux-promise`等的替代品。

`redux-center`多了一层`center`，`center`层将业务代码分离出 `action` 层和 `reducer` 层，减少了代码耦合，对于后期维护和测试非常有益。

`redux-center`目前应用于[redux-mutation](https://github.com/dog-days/redux-center)。

## 兼容性



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

## 使用注意

`center`的用法跟`reducer`很像，所以`center`的执行不能跟`reucer`冲突，例如下面就是不合理的：

```js
//伪代码
//reducer
function couter(state,action){
  switch(action.type){
    case 'same-action-type':
    break;
    default:
     	return state;
  }
}
//centers
[
  function (state,action){
    switch(action.type){
      case 'same-action-type':
      break;
      default:
        return state;
    }
  }
]
```

上面两个`case 'same-action-type'`都会执行，因为执行`center`也会执行`reducer`。

`redux-mutation`基于`redux-center`但是没有这个问题，因为`redux-center`定义了新结构，把`switch case`的条件转换成了函数名，然后就可以和`reducers`做对比了。

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
| options | object                                | 配置参数                                                     |

**options**

| options          | 类型    | 默认值 |
| ---------------- | ------- | ------ |
| shouldRunReducer | boolean | true   |

- `optons.shouldRunReducer`

  `action.type`匹配到center条件后是否运行reducer，true时无论是否匹配到center条件都要reducer，false时只有不匹配到center条件才执行reducer，这种情况下center**必须**返回true（不匹配就返回true）,例如

  ```js
  function(action){
    switch(action.type){
      case "test":
        const data = await call(fetch,'/api/data');
        await put({ type: 'test',payload: data });
        break;
      default:
        //没匹配到center条件
        //当options.shouldRunReducer为false时，这里应该return true;
        return true;
    }
  }
  ```

  shouldRunReducer=false这种模式比较容易因为没返回true，就会导致没执行到reducer，出现bug。而且当cener条件匹配到，然后没返回true的话，`redux-logger`这些日志middleware是无法监控到center的日志的。看情况场景使用。

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









