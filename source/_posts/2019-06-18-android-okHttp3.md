---
title: android okHttp3
date: 2019-06-18 10:52:40
tags: android
---
# OkHttp3使用

添加依赖，在app/build.gradle中添加依赖
```
implementation 'com.squareup.okhttp3:okhttp:3.10.0'
```

## get
一个普通的get请求

```
private void get() {
    OkHttpClient client = new  OkHttpClient.Builder().build();

    Request request = new Request.Builder()
            .addHeader("header_key", "header_value")
            .url("https://www.baidu.com")
            .get()
            .build();
    try {
        // 同步执行
        client.newCall(request).execute();
        // 异步执行
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.d(TAG, "onFailure: " + e.getMessage());
            }
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                Log.d(TAG, "onResponse: " + response.body().string());
            }
        });
    } catch (IOException e) {
        e.printStackTrace();
    }
}

```
## post


```
private void post() {
    OkHttpClient client = new  OkHttpClient.Builder().build();

    RequestBody body = new FormBody.Builder()
            .add("content", "content")
            .build();

    Request request = new Request.Builder()
            .addHeader("header_key", "header_value")
            .post(body)
            .url("https://www.baidu.com")
            .build();
    try {
        // 同步执行
        client.newCall(request).execute();
        // 异步执行
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {

            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                Log.d(TAG, "onResponse: " + response.body().string());
            }
        });
    } catch (IOException e) {
        e.printStackTrace();
    }
}

```
上面就是一个简单的post与get请求，区别就是post会多一个RequestBody


而关于okhttp的使用还有很多其他的用户，如自定义分发器Dispatch、拦截器、缓存

