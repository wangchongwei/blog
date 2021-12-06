# 数据类型
再java中，数据类型可分为两种：集合（Collection）、图（Map）
而这两大类中又可以细分，常用的子类为：
ArrayList、LinkedList、HashSet、LinkedHashSet、HashMap、LinkedHashMap

## 集合（Collection）
集合可以细分为三类：List、Set、Queue


### List
List接口扩展自Collection，它可以定义一个允许重复的有序集合

List中常用的子类有：ArrayList、LinkerList、CopyOnWriteArrayList

#### ArrayList
ArrayList内部的数据结构为数组，当增加元素数量大于初始容量，会触发扩容，即新建一个之前容量两位的数组，并将之前的元素拷贝过来。
查询快，增删慢
***非线程安全***

#### LinkedList
LinkedList内部的数据结构为链表，双向链表。
查询慢，增删快
***非线程安全***

#### CopyOnWriteArrayList
是一个线程安全的List接口的实现，它使用了ReentrantLock锁来保证在并发情况下提供高性能的并发读取。
***线程安全，通过ReentrantLock实现***

### Set
Set接口扩展自Collection，它与List的不同之处在于，规定Set的实例不包含重复的元素。
Set接口有三个具体实现类：散列集HashSet、链式散列集LinkedHashSet、树形集TreeSet

Set判断是否重复的原理是，先判断Hash，如果Hash相同再判断equals

#### HashSet
散列集HashSet是一个用于实现Set接口的具体类，
有两个名词需要关注，初始容量和客座率。
客座率是确定在增加规则集之前，该规则集的饱满程度，当元素个数超过了容量与客座率的乘积时，就会触发扩容。

***非线程安全***


#### LinkedHashSet
内部数据是链表，是用一个链表实现来扩展HashSet类，它支持对规则集内的元素排序
HashSet中的元素是没有被排序的，而LinkedHashSet中的元素可以按照它们插入规则集的顺序提取。
***非线程安全***


#### TreeSet
内部数据结构为树，
扩展自AbstractSet，并实现了NavigableSet，AbstractSet扩展自AbstractCollection，树形集是一个有序的Set，其底层是一颗树，这样就能从Set里面提取一个有序序列了。在实例化TreeSet时，我们可以给TreeSet指定一个比较器Comparator来指定树形集中的元素顺序。树形集中提供了很多便捷的方法。
***非线程安全***



### Queue
数据结构为队列，特点是先进先出，后进后出
而关于队列的实现又有多个：优先级队列、异步队列、同步队列、阻塞队列等。


## Map

Map中常用的子类有: HashMap、HashTable、LinkedHashMap、TreeMap、ConcurrentHashMap

### HashMap
HashMap在jdk1.8时发生了变更
在JDK1.7及以前的版本中：内部数据结构为：数组+链表，并且链表插入数据的方式为 头插法
在jdk1.8以及之后的版本中：内部的数据结构为：数组+链表+红黑树，并且链表插入数据的方式为 尾插法

数据存放方式为 key value，一一对应，key不允许重复
大致原理：根据key得出hash值，根据hash值对数组长度取模得出存放数组的下标，每个数组下标对于的为一个链表，将数据放入到链表，当链表长度大于阈值时，则链表转换为红黑树，红黑树节点数减少小于阈值时，则又转换回链表
取值大致过程相同：根据key获取hash，然后得出下标，然后再去链表或者红黑树中根据key对比取值

***非线程安全***

### LinkedHashMap
LinkedHashMap继承自HashMap，它主要是用链表实现来扩展HashMap类，
HashMap中条目是没有顺序的，但是在LinkedHashMap中元素既可以按照它们插入图的顺序排序，
也可以按它们最后一次被访问的顺序排
***非线程安全***

### TreeMap

TreeMap基于红黑树数据结构的实现，键值可以使用Comparable或Comparator接口来排序。TreeMap继承自AbstractMap，同时实现了接口NavigableMap，而接口NavigableMap则继承自SortedMap。SortedMap是Map的子接口，使用它可以确保图中的条目是排好序的。

在实际使用中，如果更新图时不需要保持图中元素的顺序，就使用HashMap，如果需要保持图中元素的插入顺序或者访问顺序，就使用LinkedHashMap，如果需要使图按照键值排序，就使用TreeMap。
***非线程安全***


### ConcurrentHashMap
ConcurrentHashMap 是并发包concurrent下针对HashMap的一种实现，线程安全
同HashMap相比，ConcurrentHashMap不仅保证了访问的线程安全性，而且在效率上与HashTable相比，也有较大的提高

***线程安全***

