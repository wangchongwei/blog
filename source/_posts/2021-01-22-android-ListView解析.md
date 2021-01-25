---
title: android ListView解析
date: 2021-01-22 09:57:15
tags: android
---


# ListView解析
首先是简单使用
```
class ListViewActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_list_view)
        var list = arrayListOf(Person("novia", 24), Person("justin", 29), Person("doudou", 1))
        var adapter = MyListAdapter(list, this)
        listView.adapter = adapter
    }

    class MyListAdapter(var list: ArrayList<Person>, var context: Context) : BaseAdapter() {
        override fun getCount(): Int {
            return list.size
        }

        override fun getItem(position: Int): Person {
            return list.get(position);
        }

        override fun getItemId(position: Int): Long {
            return list.get(position).hashCode().toLong()
        }

        override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
            var view = LayoutInflater.from(context).inflate(R.layout.item_listview, parent, false)
            view.findViewById<TextView>(R.id.item_name).setText(getItem(position).name)
            view.findViewById<TextView>(R.id.item_age).setText("" + getItem(position).age + "岁")
            return view;
        }
    }

    data class Person(var name: String, var age: Int)
}
```

但是ListView的特点是会将所有条目都渲染出来，当子条目较多时，会存在性能问题，当加载图片时，甚至会导致OOM

