---
title: react redux
date: 2019-12-03 09:54:38
tags: react
---

# 在react-native中集成redux


对react框架而言，状态树、dom树是它的一大优势。
而redux就是对数据、状态进行管理。

## 集成redux

1、执行
```
npm install redux --save
npm install react-redux --save
npm install redux-thunk --save
npm i redux-logger --save
```
以上命令下载关于redux的组件。

2、store的配置
```
// configStore.js
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducer';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);


export default configStore =(initState) => {

    const store = createStoreWithMiddleware(rootReducer, initState);

    return store;
}


```

而rootReducer是根reducer，因为业务都是分模块的，我们对reducer也会分层，这样使用起来也更简洁、清晰

```
// rootReducer
import { combineReducers } from 'redux';
import { reducer as test } from '../Home/store';

const appReducer = combineReducers({
    test,
});

const rootReducer =(state, action) => {
    return appReducer(state, action);
}
export default rootReducer;
```

test是一个测试的reducer。

在入口处，绑定store，在入口文件中：
```
AppRegistry.registerComponent('projectName', () => Root);
// 指向了root.js，在root.js中：

import { Provider } from 'react-redux';
import configStore from './store/configStore';

const store = configStore();

export default class Root extends React.PureComponent {

    render() {
        return (
            <Provider store={store}>
                <View style={{ flex: 1 }}>
                    {...}
                </View>
            </Provider>
        )
    }
}

```

### 使用示例

```
// actionType.js
export const TEST_REDUCE = "TEST_REDUCE";

// test action.js
import { TEST_REDUCE } from './ActionType';



const test =() => ({
    type: TEST_REDUCE,
})

export {
    test,
}

// test reducer.js
import { TEST_REDUCE } from './ActionType';

const initState = {
    num: 0,
}


export default reducer = (state = initState, action) => {

    switch(action.type) {

        case TEST_REDUCE:
            return {
                ...state,
                num: state.num + 1,
            }


        default:
            return {
                ...initState,
            }
    }

}

```

在组件component中使用
Test.js

```
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { action } from './store'


class Test extends Component {


    testFunction =() => {
        this.props.action.test();
    }

    render() {
        const { num } = this.props;
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <TouchableOpacity
                    onPress={this.testFunction}
                >
                    <Text>
                        触发按钮
                    </Text>
                    <Text>{num}</Text>
                </TouchableOpacity>

            </View>
        )
    }
}

const mapStateToProps = (state) => ({
    num: state.test.num,
})
const mapActionToProps = dispatch => {
    return {
        action: bindActionCreators(action, dispatch),
    }
}
export default connect(mapStateToProps, mapActionToProps)(Test);

```


*** 具体的使用方法已在上面，下面再去讲解redux原理 ***

## redux原理说明

redux状态管理大致流程：

component ->调用action -> dispatch action -> reducer -> 纯函数数据改变 -> state改变 -> component props改变 -> 回调到component componentWillReceiverProps生命周期 -> render

reducer中数据改变即store中数据改变为何会导致 component props改变呢？
其实就是connect函数。

我们在组件中，
export default connect(mapStateToProps, mapActionToProps)(Test);
connet是一个柯里化函数。
第一组入参两个：
第一个mapStateToProps，其实就是将store中的数据绑定到props，
第二个mapActionToProps，是将action函数绑定到props，
所以我们在使用是，如取store中的值，
const { num } = this.props;
dispatch action：this.props.action.test();

第二组入参：当前的Test对象。

再往深考虑connect 函数
