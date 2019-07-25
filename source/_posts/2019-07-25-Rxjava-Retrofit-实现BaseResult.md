---
title: Rxjava + Retrofit 实现BaseResult
date: 2019-07-25 11:24:56
tags: android
---

# Rxjava + Retrofit 实现BaseResult

最近在学习Rxjava、Retrofit的使用，同时想到想一般项目中接口返回都是由特定格式，如java后端的Resultful风格，那我们能不能在请求时写一个基础的返回类，并统一对code判断，再来处理。
答案肯定是可以的。本文只讲使用。

#### 依赖：
```
implementation 'com.squareup.retrofit2:retrofit:2.3.0'
implementation 'com.squareup.retrofit2:converter-gson:2.3.0'
implementation 'io.reactivex.rxjava2:rxandroid:2.0.2'
implementation 'io.reactivex.rxjava2:rxjava:2.x.y'
implementation 'com.squareup.retrofit2:adapter-rxjava2:2.3.0'

```
#### 普通使用案例
首先创建实体数据类Test

```
public class Test {

    private static final String TAG = "=====TEST";

    String key = "";

    String test = "";

    public void log() {
        Log.d(TAG,"key="  + key);
        Log.d(TAG, "test=" + test);
    }

}
```

在写一个接口TestServer，申明请求

```
public interface TestService {
    @GET("test.json")
    Observable<Test>getObJson();
}

```

调用请求
```
private void testService() {
      // 实例化一个Retrofit 对象
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://192.168.1.42:8080/")
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        TestServer service = retrofit.create(TestService.class);
         service.getObJson()
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new Observer<Test>() {
                    @Override
                    public void onSubscribe(Disposable d) {
                        
                    }

                    @Override
                    public void onNext(Test test) {

                    }

                    @Override
                    public void onError(Throwable e) {

                    }

                    @Override
                    public void onComplete() {

                    }
                });
    }
```

### 开发考虑
我们不可能每个请求都重新创建一个Retrofit对象，
而且要基于项目后端数据，例如resultful风格，不可能在每个请求都对code判断。
所以我们要将返回的Call 对象封装，对code判断，并返回具体的数据结构。

##### 1、写一个result实体类
```
// 因为每一个接口返回的数据结构都不同，肯定要用泛型。
public class Result<T> {

    private final String TAG = "Result ====";

    private String msg;

    private String code = "0";

    private T data;

    public void logCode() {
        Log.d(TAG, code);
    }

    public long getLongCode() {
        long resultCode = 0;
        if(code != null && !code.equals("")) {
            resultCode = Long.parseLong(code);
        }
        return resultCode;
    }

    public void log() {
        Log.d(TAG, "msg:" +msg + "\n code:" + code + "\n data:" + data);
    }

    public T getResultData() {
        return data;
    }

}

```
**注意，此处的get数据的方法不能直接用getCode，会报空指针异常，后续讨论**

然后需要写一个BaseObserver观察者基类

```
// 这里还是因为接口返回数据格式问题，使用泛型。
public abstract class BaseObserver<T> implements Observer<Result<T>> {

    private final String TAG = "====BaseObserver===";

    /**
     * 请求成功
     * @param t
     */
    public abstract void onSuccess(T t);

    /**
     * 当返回的code值错误时的默认方法
     * @param code
     */
    public void onResultCodeErr(long code) {
        Log.d(TAG, "状态码错误,错误码为：" + code);
    }

    @Override
    public void onSubscribe(Disposable d) {
        Log.d(TAG, "onSubscribe");
    }

    @Override
    public void onNext(Result result) {
        if(result.getLongCode() != 200) {
            onResultCodeErr(result.getLongCode());
        } else {
            onSuccess((T)result.getResultData());
        }
        result.log();
    }

    @Override
    public void onError(Throwable e) {
        Log.d(TAG, "onError");
        Log.d(TAG, e.getMessage());
    }

    @Override
    public void onComplete() {
        Log.d(TAG, "onComplete");
    }
}

```

然后我们的Server类就变成了如下：
```
public interface TestService {

    @GET("test.json")
    Observable<Result<Test>> getTestRxjavaJson();

    @GET("test.json")
    Observable<Test>getObJson();

}
```

调用就变成了这样：

```
BaseObserver observer = new BaseObserver<Test>() {
        @Override
        public void onSuccess(Test test) {
            Log.d("======", "onSuccess");
            test.log();
        }
    };

    /** Retrofit + Rxjav */
    private void testRxjavaService() {
        Retrofit retrofit = RetrofitUtil.getRetrofit();
        TestService ts = retrofit.create(TestService.class);
        ts.getTestRxjavaJson()
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(observer);
    }

```

写的还比较粗糙，单个接口调用时可能效果还不明显。但大致思路是这样的。
