---
title: android sqlite的使用
date: 2019-11-19 14:01:11
tags: android
---
# android sqlite的使用

### 1、创建表

a.创建java类MyDatabase继承SQLiteOpenHelper 并需要实现下面上个方法

#### onCreate（SQLiteDatabase）

在数据库第一次生成的时候会调用这个方法，也就是说，只有在创建数据库的时候才会调用，当然也有一些其它的情况，一般我们在这个方法里边生成数据库表。


#### onUpgrade（SQLiteDatabase，int，int） 
当数据库需要升级的时候，Android系统会主动的调用这个方法。一般我们在这个方法里边删除数据表，并建立新的数据表，当然是否还需要做其他的操作，完全取决于应用的需求。

#### onOpen（SQLiteDatabase）
这是当打开数据库时的回调函数，一般在程序中不是很常使用。

在构造函数中创建数据库
```
 // 数据表名
    private static final String TABLE_NAME = "userlog.db";

    public MyDatabase(@Nullable Context context, @Nullable String name, @Nullable SQLiteDatabase.CursorFactory factory, int version) {
        super(context, name, factory, version);
    }

    public MyDatabase(Context context, int version) {
        this(context, TABLE_NAME, null, version);
    }

```

在onCreate方法中创建数据表
数据库数据类型：
NULL：null值
INTEGER：整数，1、2、3、4、6、8字节
REAL：浮点值，8字节
TEXT：字符串
BLOB：blob数据
DATE：日期 年月日
TIME：时刻 时分秒

```

 @Override
    public void onCreate(SQLiteDatabase db) {
        Log.d(TAG, "onCreate: onCreate");
        String sql = "create table t_log(userId text, weight text, content text, image text, date date, time time)";
        db.execSQL(sql);
    }

```

*** 然后在需要建表的实话，初始化一个该java类实例即可 ***


### 增删改查

#### 增加 insert 一条数据

1、使用sql语句插入一条数据
```
String sql = "insert into table_name (userId, weight, content, image) values('userId','70.0', 'content', 'image_uri')";
db.execSQL(sql);
```
但使用上面这种时，字段如果含有某些特殊符号如： : ' / 等，时，则会报错。unexpect token ':'

此时应该使用 ? 替代符，如下：
```
public void insert(String userId, String weight, String content, String imageUrl, Date date, Time time ) {
    SQLiteDatabase db = getWritableDatabase();
    StringBuilder sql = new StringBuilder();
    sql.append("insert into ")
            .append(table_name)
            .append("(userId, weight, content, image, date, time) values(?,?,?,?,?,?)");
    Object []values = new Object[] {userId, weight, content, imageUrl, date, time};
    Log.d(TAG, "insert ===".concat(sql.toString().concat(values.toString())));
    db.execSQL(sql.toString(), values);
    db.close();
}

```


