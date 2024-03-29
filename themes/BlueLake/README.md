# BlueLake

[English](README.en.md) | [简体中文](README.md)

一个简洁轻量化的响应式[Hexo](https://hexo.io/)博客主题。

- [点击预览](http://chaoo.oschina.io/)

[![BlueLake template preview](http://obzf7z93c.bkt.clouddn.com/themeBlueLake.png "BlueLake template preview")](http://chaoo.oschina.io/)

## 安装

### 安装主题和渲染:

```shell
$ git clone https://github.com/chaooo/hexo-theme-BlueLake.git themes/BlueLake
$ npm install hexo-renderer-jade@0.3.0 --save
$ npm install hexo-renderer-stylus --save
```

### 启用

在 Hexo 配置文件（`hexo/_config.yml`）中把主题设置修改为`BlueLake`。

```bash
theme: BlueLake
```

如果你想生成压缩后的 css，在（`hexo/_config.yml`）中添加：

```yml
stylus:
  compress: true
```

### 更新

```bash
cd themes/BlueLake
git pull
```

## 配置

打开`themes/BlueLake/_config.yml`进行配置。

```yml
##########################
## Site Config Settings ##
##########################

# Theme version
version: 2.0.1

# Header
menu:
  - page: home
    directory: .
    icon: fa-home
  - page: archive
    directory: archives/
    icon: fa-archive
  - page: about
    directory: about/
    icon: fa-user
  - page: rss
    directory: atom.xml
    icon: fa-rss

# Sidebar
widgets:
  - recent_posts
  - category
  - tag
  - archive
  #- weibo
  - links

# Toc
toc:
  enable: true
  number: false

# Static files
js: js
css: css

# Extensions
Plugins: hexo-generator-feed
  hexo-generator-sitemap
  hexo-generator-baidu-sitemap

#Feed Atom
feed:
  type: atom
  path: atom.xml
  limit: 20

#sitemap
sitemap:
  path: sitemap.xml
baidusitemap:
  path: baidusitemap.xml

#Local search
local_search: true ## Use a javascript-based local search engine, true/false.

#Cmments
comment:
  duoshuo: #chaooo ## duoshuo_shortname
  disqus: ## disqus_shortname
  livere: ## 来必力(data-uid)
  uyan: ## 友言(uid)
  cloudTie: ## 网易云跟帖(productKey)
  changyan: ## 畅言需在下方配置两个参数，此处不填。
    appid: ## 畅言(appid)
    appkey: ##畅言(appkey)

#Share
baidu_share: true ## 百度分享
JiaThis_share: ##true ##JiaThis分享
duoshuo_share: #true ##true 多说分享必须和多说评论一起使用。

# Analytics
google_analytics: ## Your Google Analytics tracking id, e.g. UA-42025684-2
baidu_analytics: ## Your Baidu Analytics tracking id, e.g. 1006843030519956000

# Miscellaneous
show_category_count: true ## If you want to show the count of categories in the sidebar widget please set the value to true.
widgets_on_small_screens: true ## Set to true to enable widgets on small screens.
busuanzi: true ## If you want to use Busuanzi page views please set the value to true.

# About page
about:
  photo_url: ## Your photo e.g. http://obzf7z93c.bkt.clouddn.com/themeauthor.jpg
  items:
    - label: email
      url: wcw1992yu@163.com ## Your email with mailto: e.g.  mailto:zhenggchaoo@gmail.com
      title: ## Your email e.g.  zhenggchaoo@gmail.com
    - label: github
      url: ## Your github'url e.g.  https://github.com/chaooo
      title: ## Your github'name e.g.  chaooo
    - label: weibo
      url: ## Your weibo's url e.g.  http://weibo.com/zhengchaooo
      title: ## Your weibo's name e.g.  秋过冬漫长
    - label: twitter
      url:
      title:
    - label: facebook
      url:
      title:

# Friend link
links:
  - title: site-name1
    url: http://www.example1.com/
  - title: site-name2
    url: http://www.example2.com/
  - title: site-name3
    url: http://www.example3.com/
```

- **version** - 用于自动刷新 CDN 上的静态文件。
- **menu** - 导航菜单。
- **widgets** - 侧边栏中的窗口小部件。
- **Toc** - 文章目录
- **Static files** - 静态文件目录，以方便 CDN 使用。
- **Local search**
- self_search - 默认本地 JS 搜索.
- **Cmments**
- duoshuo - 若使用[多说评论](http://duoshuo.com)，注册多说后在这填写 short_name(用于评论与分享)。
- disqus - 若使用[Disqus 评论](https://disqus.com)，注册 Disqus 后在这填写 short_name。
- livere- 若使用[来必力评论](https://livere.com)，注册来必力,获得 data-uid。
- uyan - 若使用[友言评论](http://www.uyan.cc/)，注册友言,获得 uid。
- cloudTie - 若使用[网易云跟帖评论](https://gentie.163.com/info.html)，注册网易云跟帖,获得 productKey。
- changyan - 若使用[畅言评论](http://changyan.kuaizhan.com)，注册畅言，获得 appid，appkey。
- **About page** - 关于我页面(hexo new page 'about')。
- **links** - 友情链接。
- **Miscellaneous**
- show_category_count - 是否在侧边栏分类中显示类别的数量（true/false）.
- widgets_on_small_screens - 小屏幕下侧边栏在底部显示.
- busuanzi - 用[Busuanzi](http://busuanzi.ibruce.info)来统计网站访问量.
- google_analytics - [Google Analytics](https://www.google.com/analytics/) tracking ID。
- baIDu_analytics - [Baidu Analytics](http://tongji.baidu.com) tracking ID。

## 特征

#### 站点图标

您可以准备一张 ico 格式并命名为** favicon.ico **，请将其放入 hexo 目录的`source`文件夹，建议大小：32px \* 32px。

您可以为苹果设备添加网站徽标，请将名为** apple-touch-icon.png **的图像放入 hexo 目录的“source”文件夹中，建议大小为：114px \* 114px。

#### 添加站点关键字

请在 hexo 目录的“hexo/\_config.yml”中添加`keywords`字段，如：

```YAML
# Site
title: Hexo
subtitle: 副标题
description: 网站简要描述,如：Charles·Zheng's blog.
keywords: 网站关键字, key, key1, key2, key3
author: Charles
language: zh-CN
```

#### 设置阅读全文

您可以在文章的 front-matter 中添加 description，并提供文章摘录，或在文章中使用‘‘`<!--more-->`’’手动进行截断（Hexo 推荐的方式）。

#### 自定义 page 页面

在`source`文件夹中创建文件夹`index.md`来添加页面，并在`index.md`的`front-matter'中添加`layout：page`。 Create folders inlcuding `index.md`in`source`folder to add pages, and add a`layout: page`in`front-matter`of`index.md`.

#### About 页面

此主题默认 page 页面是关于我页面的布局，生成一个关于我页面：

```shell
$ hexo new page 'about'
```

配置照片地址、邮箱、微博链接、微博名、GitHub 链接、Github 名：

```YAML
# About page
about:
  photo_url: ## Your photo e.g. http://obzf7z93c.bkt.clouddn.com/themeauthor.jpg
  items:
  - label: email
    icon: fa-email
    url: ## Your email with mailto: e.g.  mailto:zhenggchaoo@gmail.com
    title: ## Your email e.g.  zhenggchaoo@gmail.com
  - label: github
    icon: fa-github
    url: ## Your github'url e.g.  https://github.com/chaooo
    title: ## Your github'name e.g.  chaooo
  - label: weibo
    icon: fa-weibo
    url: ## Your weibo's url e.g.  http://weibo.com/zhengchaooo
    title: ## Your weibo's name e.g.  秋过冬漫长
  - label: twitter
    icon: fa-twitter
    url:
    title:
  - label: facebook
    icon: fa-facebook
    url:
    title:
```

[点击预览 About 页面](http://chaoo.oschina.io/about/)

#### 代码语法高亮

请在 hexo 目录的“hexo/\_config.yml”中设置“highlight”选项，如下所示：

```YAML
highlight:
  enable: true
  auto_detect: true
  line_number: true
  tab_replace:
```

#### 本地搜索

如果要使用本地站点搜索，您必须安装插件[hexo-generator-json-content](https://github.com/alexbruno/hexo-generator-json-content)来创建 JSON 搜索文件 ，然后将配置添加到`hexo/_config.yml`：

```shell
$ npm install hexo-generator-json-content@2.2.0 --save
```

然后在`hexo/_config.yml`添加配置：

```YAML
jsonContent:
  meta: false
  pages: false
  posts:
    title: true
    date: true
    path: true
    text: true
    raw: false
    content: false
    slug: false
    updated: false
    comments: false
    link: false
    permalink: false
    excerpt: false
    categories: false
    tags: true
```

#### 语言

该主题目前有七种语言：简体中文（zh-CN），繁体中文（zh-TW），英语（en），法语（fr-FR），德语（de-DE），韩语 （ko）,西班牙语（es-ES）,欢迎修改主题并翻译成其他语言。

## Solutions

- 检查您当前的 hexo 的根目录，是否包含`source /`，`themes /`等。
- 如果你在使用这个主题有任何问题，请随时打开一个[issue](https://github.com/chaooo/hexo-theme-BlueLake/issues)，或者给我发邮件[zhenggchaoo@gmail.com](zhenggchaoo@gmail.com)。

## 浏览器支持

![Imgur](http://i.imgur.com/iO9L5ty.png)

## License

[MIT License](LICENSE)

## 贡献

欢迎各种形式的贡献（增强功能，添加新功能，撰写文档，改进代码，提交问题和检查 BUG...）。

期待您的 pull request。
