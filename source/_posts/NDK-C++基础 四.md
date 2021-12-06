


## 浅拷贝与深拷贝

浅拷贝与深拷贝的区别：浅拷贝只能拷贝数据中的栈内存空间数据，深拷贝是拷贝所以数据，包括堆内存中的数据

### 浅拷贝

在之前讲过的拷贝构造函数，其实就是一种 浅拷贝 
但是在浅拷贝中，无法拷贝堆内存中的数据

```
class Student1
{
public:

	int age;
	char * name;

	Student1() { cout << "无参构造函数" << endl; }

	Student1(char * name) :Student1(name, 99) { cout << "一个入参 构造函数" << endl; }

    Student1(char * name, int age) { 
		cout << "两个入参构造函数" << endl;

		this->name = (char *) malloc(sizeof(char * ) * 10);
		strcpy(this->name, name);

		this->age = age;
	}

	~Student1() {
		cout << "析构函数" << endl;

		free(this->name);
		this->name = NULL;
	}

};

```

如上所示，Student 类中，在构造函数中，name 是动态开辟在堆内存上的，在析构函数中，会使用free释放 name 在堆内存的内存空间

```
void main() {

	Student1 s1;
	Student1 s2 = s1; 

	cout << &s1 << endl;
	cout << &s2 << endl;

}
```
当我们执行完上述代码时，会运行异常，
Student1 s2 = s1;  会执行 拷贝构造函数，将 s2 的值都复制给 s1
但是之前说过 * 拷贝构造函数是 浅拷贝 *
浅拷贝 是不会拷贝堆内存中的数据的， 所以其实 s2 与 s1 中的 name 指向的同一块堆内存空间，
当main函数执行完毕，出栈时，会调用 s2、s1的析构函数，当指向s1的析构函数时，会释放 name 中的堆内存空间。
等到执行 s2 的析构函数时，又会执行 free(this->name); 但此时 this->name已经是一块指向NULL的指针了，此时就会抛出异常。



### 深拷贝
上面讲了深拷贝与浅拷贝的区别，以及默认的拷贝构造函数是一次浅拷贝，接下来手动实现一下 深拷贝

```
class Student
{
public:

	int age;
	char * name;

	Student() { cout << "无参构造函数" << endl; }

	Student(char * name) :Student(name, 99) {
		cout << "一个参数构造函数 this:" << (int)this << endl;
	}

	Student(char * name, int age) {
		this->name = (char *)malloc(sizeof(char *)* 10);
		strcpy(this->name, name);
		this->age = age;
	}

	~Student() {
		cout << "析构函数 &this->name:" << (int)this->name << endl;

		free(this->name);
		this->name = NULL;
	}

	Student(const Student & stu) {


		cout << "stu的地址 &stu:" << (int)&stu << " this:" << (int)this << endl;

		// 重新开辟一个堆内存存放新的 stu对象中的 name
		this->name = (char *)malloc(sizeof(char *)* 10);
        // 复制name中的值
		strcpy(this->name, name);
		this->age = stu.age;

	}


};

void showStudent(Student stu) {
	cout << "showStudent的内存地址" << (int)&stu << "  " << stu.name << "," << stu.age<< endl;
}

void main() {
	Student stu("justin", 31);

	showStudent(stu);
	showStudent(stu);
	showStudent(stu);
	showStudent(stu);
	showStudent(stu);

	getchar();
}
```
如上所述，在函数 showStudent 中会调用拷贝构造函数 然后执行完毕出栈，调用 析构函数，
但上述代码不会出现异常，因为在我们自定义的拷贝构造函数中，我们手动实现了堆内存的拷贝。并每次执行析构函数时，又会释放掉name的堆内存。