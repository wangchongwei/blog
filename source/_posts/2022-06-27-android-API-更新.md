---
title: android API 更新
date: 2022-06-27 16:05:51
tags: android
---

# android API 更新记录

## android API 30 （android11）应用文件管理权限


在andorid6之后需要动态请求权限，如针对文件写入、读取权限

```kotlin
if(checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED){
    var permissionArray = arrayOf(
        Manifest.permission.WRITE_EXTERNAL_STORAGE,
        Manifest.permission.READ_EXTERNAL_STORAGE,
    )
    requestPermissions(permissionArray, 101)
}

```

但是在android 11之后，这样也会弹出应用权限请求，但写入文件到sdcrd还是会失败，报错：/storage/emulated/0/io/okio.txt: open failed: ENOENT (No such file or directory)


需要修改请求权限的方式为：

```kotlin
if (!Environment.isExternalStorageManager()) {
    var intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
    intent.setData(Uri.parse("package:" + getPackageName()));
    startActivityForResult(intent, 102);
}
```