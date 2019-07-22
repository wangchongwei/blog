---
title: react发布到javaweb
date: 2019-07-05 14:29:35
tags: react+spring
---
# react项目发布到javaweb中

### 1、打包react

直接执行npm run build命令：发现在build目录下生成资源文件，
但是打开index.html发现报错，发现在生成的index.html中引入的文件路径有问题：/static

/多余，或者说少了.  正确的路径应该是：static 或者 ./static

发现是%PUBLIC_URL%问题，在构建时应该执行

*** PUBLIC_URL=./ npm run build ***


### 2、集成到javaweb中

将上一步生成build目录下的文件都复制放在webapp路径下，启动应用就能直接访问到index.html文件
