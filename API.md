# API

```js
import createCenter from 'redux-center';
import generatorsToAsync from 'redux-center/lib/generators-to-async';
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

| 参数    | 类型                      | 说明                                                         |
| ------- | ------------------------- | ------------------------------------------------------------ |
| centers | async function<br />array | `center`函数或者`center`数组函数<br />使用`generator`函数时，需要使用`generatorsToAsync` |
| options | object                    | 配置参数                                                     |

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

### generatorsToAsync

在使用`generator`的情况下需要使用`combineCenters`，会把`generator`转换成`async`。

```js
function(generators) => ...function
```

使用例子

```js
import createCenter from 'redux-center';
import generatorsToAsync from 'redux-center/lib/generators-to-async';

const centerInstance = createCenter(generatorsToAsync(centers));
```

#### 参数

| 参数       | 类型              | 说明          |
| ---------- | ----------------- | ------------- |
| generators | array \| function | generator函数 |

