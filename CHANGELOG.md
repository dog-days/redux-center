## 0.0.8(2010-03-13)

### Bug Fix

- 解决安装 redux-center 时, 找不到 cross-spawn 报错问题

### Update

无

### New Function

- 无

## 0.0.7(2018-11-06)

### Bug Fix

- 解决发布会安装会触发 npm run bootstrap 的问题

### Update

无

### New Function

- 无

## 0.0.4(2018-10-31)

### Bug Fix

无

### Update

- 删除`combine-center.js`
- async 语法使用 Promise 代替（减少转换的代码量）

### New Function

- 无

## 0.0.3(2018-10-18)

### Bug Fix

无

### Update

无

### New Function

- 新增 createCenter options.shouldRunReducer 参数，默认为 true

  可以配置，是否默认执行 reducer，还是 center 返回 true，才执行。

## 0.0.2(2018-10-17)

### Bug Fix

无

### Update

- center 不运行 next 改为运行 next（只要 dispatch 就好触发 listener）

### New Function

无

## 0.0.1(2018-10-15)

首次发布

### Bug Fix

无

### Update

无

### New Function

无
