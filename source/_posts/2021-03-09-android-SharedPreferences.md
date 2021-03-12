---
title: android SharedPreferences
date: 2021-03-09 16:29:28
tags: android
---

# 原理


SharedPreferences 存取值原理，其实还是将数据写入到xml文件 以及 缓存中。
Context.getSharedPreferences 都是在ContextImpl中实现，但是在API23之前、23之后实现方式却不同


## API 23


```
@Override
public SharedPreferences getSharedPreferences(String name, int mode) {
    SharedPreferencesImpl sp;
    synchronized (ContextImpl.class) {
        // 第一次为空时，初始化值
        if (sSharedPrefs == null) {
            sSharedPrefs = new ArrayMap<String, ArrayMap<String, SharedPreferencesImpl>>();
        }
        // 获取对应packageName下的 sp实例集合 也是当前应用第一次使用时初始化
        final String packageName = getPackageName();
        ArrayMap<String, SharedPreferencesImpl> packagePrefs = sSharedPrefs.get(packageName);
        if (packagePrefs == null) {
            packagePrefs = new ArrayMap<String, SharedPreferencesImpl>();
            sSharedPrefs.put(packageName, packagePrefs);
        }
        if (mPackageInfo.getApplicationInfo().targetSdkVersion <
                Build.VERSION_CODES.KITKAT) {
            if (name == null) {
                name = "null";
            }
        }
        // 根据传入的name获取对应的sp实例，第一次初始化  获取对应的文件
        sp = packagePrefs.get(name);
        if (sp == null) {
            File prefsFile = getSharedPrefsFile(name);
            sp = new SharedPreferencesImpl(prefsFile, mode);
            packagePrefs.put(name, sp);
            return sp;
        }
    }
    if ((mode & Context.MODE_MULTI_PROCESS) != 0 ||
        getApplicationInfo().targetSdkVersion < android.os.Build.VERSION_CODES.HONEYCOMB) {
        sp.startReloadIfChangedUnexpectedly();
    }
    return sp;
}

@Override
public File getSharedPrefsFile(String name) {
    return makeFilename(getPreferencesDir(), name + ".xml");
}

```



ContextImpl 中 维护有一个 静态集合 sSharedPrefs = ArrayMap<String, ArrayMap<String, SharedPreferencesImpl>> 
sSharedPrefs 全局唯一

该map中 key为 应用包名，value 为一个 packagePrefs ArrayMap<String, SharedPreferencesImpl>,

SharedPreferencesImpl 是单个sp实例信息， 文件、数据map缓存

packagePrefs 存有一个应用中所有的 sp实例 SharedPreferencesImpl

sSharedPrefs 存有所有应用关于sp的实例信息

** 存取值其实就是在集合sSharedPrefs中通过包名packageName获取到 packagePrefs，再根据 初入的name获取到指定的 SharedPreferencesImpl实例，然后再通过实例来读写数据 **


getSharedPrefsFile 就是返回 应用data文件夹/shared_prefs/ name.xml


## API 24及以上

ContextImp 中存在两个 getSharedPreferences函数，
public SharedPreferences getSharedPreferences(String name, int mode);
public SharedPreferences getSharedPreferences(File file, int mode);


```
private ArrayMap<String, File> mSharedPrefsPaths;
private static ArrayMap<String, ArrayMap<File, SharedPreferencesImpl>> sSharedPrefsCache;

@Override
public SharedPreferences getSharedPreferences(String name, int mode) {
  
    if (mPackageInfo.getApplicationInfo().targetSdkVersion <
            Build.VERSION_CODES.KITKAT) {
        if (name == null) {
            name = "null";
        }
    }

    File file;
    synchronized (ContextImpl.class) {
        // 获取name 对应的文件
        if (mSharedPrefsPaths == null) {
            mSharedPrefsPaths = new ArrayMap<>();
        }
        file = mSharedPrefsPaths.get(name);
        if (file == null) {
            file = getSharedPreferencesPath(name);
            mSharedPrefsPaths.put(name, file);
        }
    }
    return getSharedPreferences(file, mode);
}

@Override
public SharedPreferences getSharedPreferences(File file, int mode) {
    SharedPreferencesImpl sp;
    synchronized (ContextImpl.class) {
        // 获取当前运行应用的 sp集合
        final ArrayMap<File, SharedPreferencesImpl> cache = getSharedPreferencesCacheLocked();
        sp = cache.get(file);
        if (sp == null) {
            checkMode(mode);
            if (getApplicationInfo().targetSdkVersion >= android.os.Build.VERSION_CODES.O) {
                if (isCredentialProtectedStorage()
                        && !getSystemService(UserManager.class)
                                .isUserUnlockingOrUnlocked(UserHandle.myUserId())) {
                    throw new IllegalStateException("SharedPreferences in credential encrypted "
                            + "storage are not available until after user is unlocked");
                }
            }
            // 新建 SharedPreferencesImpl 对象
            sp = new SharedPreferencesImpl(file, mode);
            cache.put(file, sp);
            return sp;
        }
    }
    if ((mode & Context.MODE_MULTI_PROCESS) != 0 ||
        getApplicationInfo().targetSdkVersion < android.os.Build.VERSION_CODES.HONEYCOMB) {
        // If somebody else (some other process) changed the prefs
        // file behind our back, we reload it.  This has been the
        // historical (if undocumented) behavior.
        sp.startReloadIfChangedUnexpectedly();
    }
    return sp;
}

private ArrayMap<File, SharedPreferencesImpl> getSharedPreferencesCacheLocked() {
    if (sSharedPrefsCache == null) {
        sSharedPrefsCache = new ArrayMap<>();
    }

    final String packageName = getPackageName();
    ArrayMap<File, SharedPreferencesImpl> packagePrefs = sSharedPrefsCache.get(packageName);
    if (packagePrefs == null) {
        packagePrefs = new ArrayMap<>();
        sSharedPrefsCache.put(packageName, packagePrefs);
    }

    return packagePrefs;
}
```

在api24以后，ContextImpl中不再维护有静态的sSharedPrefs集合，
而是维护有一个ArrayMap mSharedPrefsPaths ，以及一个静态集合ArrayMap sSharedPrefsCache
sSharedPrefs key为name，value为文件
sSharedPrefsCache ArrayMap<String, ArrayMap<File, SharedPreferencesImpl>>  key为包名packageName， value 为集合ArrayMap<File, SharedPreferencesImpl>


getSharedPreferences(String name, int mode)函数中，先通过name获取到对应的文件，再调用public SharedPreferences getSharedPreferences(File file, int mode);

## API 23 与 24 的差异

从上面来看，API23与24差异很小，其实就是将内部的集合的key从 string 改成了 file，
在API24中，增多一个mSharedPrefsPaths集合，在集合中就有 name 与 file的映射关系。 
对于需要频繁获取的sp实例来说，可能略有优化，但是也增加了内存消耗。



## 

```
@UnsupportedAppUsage
SharedPreferencesImpl(File file, int mode) {
    mFile = file;
    mBackupFile = makeBackupFile(file);
    mMode = mode;
    mLoaded = false;
    mMap = null;
    mThrowable = null;
    startLoadFromDisk();
}

@UnsupportedAppUsage
private void startLoadFromDisk() {
    synchronized (mLock) {
        mLoaded = false;
    }
    new Thread("SharedPreferencesImpl-load") {
        public void run() {
            loadFromDisk();
        }
    }.start();
}

private void loadFromDisk() {
    synchronized (mLock) {
        if (mLoaded) {
            return;
        }
        if (mBackupFile.exists()) {
            mFile.delete();
            mBackupFile.renameTo(mFile);
        }
    }

    // Debugging
    if (mFile.exists() && !mFile.canRead()) {
        Log.w(TAG, "Attempt to read preferences file " + mFile + " without permission");
    }

    Map<String, Object> map = null;
    StructStat stat = null;
    Throwable thrown = null;
    try {
        stat = Os.stat(mFile.getPath());
        if (mFile.canRead()) {
            BufferedInputStream str = null;
            try {
                str = new BufferedInputStream(
                        new FileInputStream(mFile), 16 * 1024);
                map = (Map<String, Object>) XmlUtils.readMapXml(str);
            } catch (Exception e) {
                Log.w(TAG, "Cannot read " + mFile.getAbsolutePath(), e);
            } finally {
                IoUtils.closeQuietly(str);
            }
        }
    } catch (ErrnoException e) {
        // An errno exception means the stat failed. Treat as empty/non-existing by
        // ignoring.
    } catch (Throwable t) {
        thrown = t;
    }

    synchronized (mLock) {
        mLoaded = true;
        mThrowable = thrown;

        // It's important that we always signal waiters, even if we'll make
        // them fail with an exception. The try-finally is pretty wide, but
        // better safe than sorry.
        try {
            if (thrown == null) {
                if (map != null) {
                    mMap = map;
                    mStatTimestamp = stat.st_mtim;
                    mStatSize = stat.st_size;
                } else {
                    mMap = new HashMap<>();
                }
            }
            // In case of a thrown exception, we retain the old map. That allows
            // any open editors to commit and store updates.
        } catch (Throwable t) {
            mThrowable = t;
        } finally {
            mLock.notifyAll();
        }
    }
}
```

当新建 SharedPreferencesImpl 时，会初始化一些变量，并且执行startLoadFromDisk
在startLoadFromDisk 中会新开线程执行 loadFromDisk 
在loadFromDisk 中，会删除原文件，然后将 备份文件重命名 

然后就是通过文件流读取 文件信息，将读取到的信息赋值给 SharedPreferencesImpl中的 map对象。
同时对文件的读取都是加锁操作的。当文件读取完成了，执行mLock.notifyAll();唤醒所有操作线程。 

`
loadFromDisk 需要新开线程也是互斥的问题，必须保证load 与读写不在同一线程，才能让不会一直await，在加载完能够唤醒读写的操作继续。
`


### getValue()

内部有针对不同类型的get方法，基本都一致，看一个就可以了。
```
public String getString(String key, @Nullable String defValue) {
    synchronized (mLock) {
        awaitLoadedLocked();
        String v = (String)mMap.get(key);
        return v != null ? v : defValue;
    }
}
```
读操作也是加锁的，防止读、写同时，导致数据异常，同时也跟上面的 loadFromDisk 中加锁呼应，防止问价还未加载完就进行读写操作

### put

put操作需要通过内部类EditorImpl来完成。

```
 @Override
public Editor edit() {
    // 当文件未加载完，即loadFromDisk未执行完时，会一直等待。
    synchronized (mLock) {
        awaitLoadedLocked();
    }
    // 每次获取edit时都是重新创建一个对象。
    return new EditorImpl();
}
```
每次获取Edit对象时都是返回一个新的对象，所以尽量将数据操作合并，不要频繁去重新获取edit对象。
在看一下put数据的方法

```
private final Map<String, Object> mModified = new HashMap<>();
@Override
public Editor putString(String key, @Nullable String value) {
    synchronized (mEditorLock) {
        mModified.put(key, value);
        return this;
    }
}
```
执行put方法时，只是将数据提交到 EditorImpl 中的一个HashMap中，
只有在commit 或者 apply时，才会将数据合并、写入到文件中。

* QA：为何要设计一个mModified，来保存数据，而不是直接提交合并到文件？
这样可以避免频繁操作文件，只有在执行commit、apply时才去操作文件，提高效率，是一种优化手段。

### commit

```
@Override
public boolean commit() {
    long startTime = 0;

    if (DEBUG) {
        startTime = System.currentTimeMillis();
    }
    // 合并mModified数据到一个新的集合，并清除mModified数据，并记录哪些key的value发生更改，最后将合并的数据包装成一个MemoryCommitResult对象
    MemoryCommitResult mcr = commitToMemory();
    // 将mcr加入文件写入队列，注意第二个参数为null，标示 直接写入，不需等待
    SharedPreferencesImpl.this.enqueueDiskWrite(
        mcr, null /* sync write on this thread okay */);
    try {
        // 等待写入结果
        mcr.writtenToDiskLatch.await();
    } catch (InterruptedException e) {
        return false;
    } finally {
        if (DEBUG) {
            Log.d(TAG, mFile.getName() + ":" + mcr.memoryStateGeneration
                    + " committed after " + (System.currentTimeMillis() - startTime)
                    + " ms");
        }
    }
    // 唤醒监听器，发送消息，数据更改操作结束
    notifyListeners(mcr);
    return mcr.writeToDiskResult;
}
```


### apply

```
@Override
public void apply() {
    final long startTime = System.currentTimeMillis();
    final MemoryCommitResult mcr = commitToMemory();
    final Runnable awaitCommit = new Runnable() {
            @Override
            public void run() {
                try {
                    mcr.writtenToDiskLatch.await();
                } catch (InterruptedException ignored) {
                }

                if (DEBUG && mcr.wasWritten) {
                    Log.d(TAG, mFile.getName() + ":" + mcr.memoryStateGeneration
                            + " applied after " + (System.currentTimeMillis() - startTime)
                            + " ms");
                }
            }
        };

    QueuedWork.addFinisher(awaitCommit);

    Runnable postWriteRunnable = new Runnable() {
            @Override
            public void run() {
                awaitCommit.run();
                QueuedWork.removeFinisher(awaitCommit);
            }
        };

    SharedPreferencesImpl.this.enqueueDiskWrite(mcr, postWriteRunnable);

    notifyListeners(mcr);
}
```
可以看到 apply、commit两个函数基本相同，主要时在 enqueueDiskWrite 函数执行时，传入的第二个参数不同 


### enqueueDiskWrite
```
private void enqueueDiskWrite(final MemoryCommitResult mcr,
                                  final Runnable postWriteRunnable) {
    // commit时,传入的postWriteRunnable为null， isFromSyncCommit 为true， 
    // apply时 postWriteRunnable != null isFromSyncCommit = false

    final boolean isFromSyncCommit = (postWriteRunnable == null);
    final Runnable writeToDiskRunnable = new Runnable() {
            @Override
            public void run() {
                synchronized (mWritingToDiskLock) {
                    writeToFile(mcr, isFromSyncCommit);
                }
                synchronized (mLock) {
                    mDiskWritesInFlight--;
                }
                if (postWriteRunnable != null) {
                    postWriteRunnable.run();
                }
            }
        };

    // commit 才会进入这个判断，并最终执行writeToDiskRunnable 然后return
    if (isFromSyncCommit) {
        boolean wasEmpty = false;
        synchronized (mLock) {
            wasEmpty = mDiskWritesInFlight == 1;
        }
        if (wasEmpty) {
            writeToDiskRunnable.run();
            return;
        }
    }
    // apply 会执行此处
    QueuedWork.queue(writeToDiskRunnable, !isFromSyncCommit);
}
```

### commit、apply差异
从上面的注释也可以看出， commit会直接在当前线程执行 writeToDiskRunnable.run();
而 apply 会将 writeToDiskRunnable 加入队列 QueuedWork.queue(writeToDiskRunnable, !isFromSyncCommit);等待线程池执行任务。


## 总结

SP是线程安全的，通过锁、await、notifyAll，保证并行时不会读写异常。

SP通过全局静态ArrayMap维护一个集合，通过packageName、name找到对应的读写文件file、SPImpl实例。

读操作是加载file完之后，直接在缓存的一个集合Map中根据key读取即可。

写操作是先将需要写入的数据都缓存到一个HashMap中，再在commit或者apply时与file中的数据合并，并标示哪些key发生改变，包装成一个MemoryCommitResult对象。

写操作只是修改缓存的HashMap，修改持久化的数据还需要执行commit或者apply。

commit 是当前线程直接执行，而 apply是添加到任务队列等待线程池执行。



## 优化建议

* 不要存放大的key和value在SharedPreferences中，否则会一直存储在内存中得不到释放，内存使用过高会频发引发GC，导致界面丢帧甚至ANR。

* 不相关的配置选项最好不要放在一起，单个文件越大读取速度则越慢。

* 读取频繁的key和不频繁的key尽量不要放在一起（如果整个文件本身就较小则忽略，为了这点性能添加维护得不偿失）。

* 不要每次都edit，因为每次都会创建一个新的EditorImpl对象，最好是批量处理统一提交。否则edit().commit每次创建一个EditorImpl对象并且进行一次IO操作，严重影响性能。

* commit发生在UI线程中，apply发生在工作线程中，对于数据的提交最好是批量操作统一提交。虽然apply发生在工作线程（不会因为IO阻塞UI线程）但是如果添加任务较多也有可能带来其他严重后果
    （参照ActivityThread源码中handleStopActivity方法实现）

* 尽量不要存放json和html，这种可以直接文件缓存。

* 不要指望它能够跨进程通信 Context.PROCESS

* 最好提前初始化SharedPreferences，避免SharedPreferences第一次创建时读取文件线程未结束而出现等待情况。
