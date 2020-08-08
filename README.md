<h1 align="center">
  <a href="http://doc.cms.talelin.com/">
  <img src="http://doc.cms.talelin.com/left-logo.png" width="250"/></a>
  <br>
  Lin-CMS-Koa
</h1>

<h4 align="center">一个简单易用的CMS后端项目</h4>

<p align="center">
  <a href="http://flask.pocoo.org/docs/1.0/" rel="nofollow">
  <img src="https://img.shields.io/badge/koa-2.7.0-green.svg" alt="flask version" data-canonical-src="https://img.shields.io/badge/koa-2.7.0-green.svg" style="max-width:100%;"></a>
  <a href="https://pypi.org/project/Lin-CMS/" rel="nofollow"><img src="https://img.shields.io/badge/lin--mizar-0.3.5-green.svg" alt="lin-cms version" data-canonical-src="https://img.shields.io/badge/lin--cms--test-0.0.1--alpha8-red.svg" style="max-width:100%;"></a>
  <a href="http://doc.cms.talelin.com/" rel="nofollow"><img src="https://img.shields.io/badge/license-MIT-lightgrey.svg" alt="LISENCE" data-canonical-src="https://img.shields.io/badge/license-MIT-lightgrey.svg" style="max-width:100%;"></a>
</p>

<blockquote align="center">
  <em>Lin-CMS</em> 是林间有风团队经过大量项目实践所提炼出的一套<strong>内容管理系统框架</strong>。<br>
 Lin-CMS 可以有效的帮助开发者提高 CMS 的开发效率。
</blockquote>

<p align="center">
  <a href="#简介">简介</a>&nbsp;|&nbsp;<a href="#版本日志">版本日志</a>
</p>

## 简介

### 什么是 Lin CMS？

Lin-CMS 是林间有风团队经过大量项目实践所提炼出的一套**内容管理系统框架**。Lin-CMS 可以有效的帮助开发者提高 CMS 的开发效率。

本项目是 Lin CMS 后端的 koa 实现，需要前端？请访问[前端仓库](https://github.com/TaleLin/lin-cms-vue)。

### 当前最新版本

lin-cms-koa(当前示例工程)：0.3.9

lin-mizar(核心库) ：0.3.8

### 文档地址

[http://doc.cms.talelin.com/](http://doc.cms.talelin.com/)

### 线上 demo

[http://face.cms.7yue.pro/](http://face.cms.7yue.pro/)

### 免费入门视频教程 

[https://www.imooc.com/learn/1247](https://www.imooc.com/learn/1247)

### QQ 交流群

QQ 群号：643205479 / 814597236

<!-- <img class="QR-img" width="258" height="300" src="http://imglf3.nosdn0.126.net/img/Qk5LWkJVWkF3Nmdyc2xGcUtScEJLOVV1clErY1dJa0FsQ3E1aDZQWlZHZ2dCbSt4WXA1V3dRPT0.jpg?imageView&thumbnail=1680x0&quality=96&stripmeta=0&type=jpg"> -->

### 微信公众号

微信搜索：林间有风

<img class="QR-img" src="http://imglf6.nosdn0.126.net/img/YUdIR2E3ME5weEdlNThuRmI4TFh3UWhiNmladWVoaTlXUXpicEFPa1F6czFNYkdmcWRIbGRRPT0.jpg?imageView&thumbnail=500x0&quality=96&stripmeta=0&type=jpg">

## 版本日志

最新版本 `0.3.9`

### 0.3.9

1. `F` 修复 logger 第二次模板解析错误的问题
2. `U` 更新 lin-mizar 到 0.3.8

### 0.3.8

1. `F` 修复 缺少 mysql2

### 0.3.7

1. `U` 优化 编辑用户至少选择一个分组

### 0.3.6

1. `A` 新增 yarn.lock
2. `U` 更新 lin-mizar 到 0.3.5 版本
3. `F` 修复 disableLoading 为 `undefined` 的问题

### 0.3.5

1. `U` 更新核心库 lin-mizar 到 0.3.4 版本
2. `F` 修复文件上传丢失 key 字段

### 0.3.4

1. `U` 更新路由视图权限挂载的方式
2. `U` HttpException 不允许直接修改 status，传入的参数由 errorCode 改为 code
3. `U` 新增 code-message 配置，返回的成功码和错误码都在这里配置
4. `U` 支持自定义工作目录
5. `U` 更新核心库 lin-mizar 到 0.3.3 版本

### 0.3.3

1. `F` `GET /cms/user/information` 返回完整的头像链接
2. `F` 文件名重命名为用 `-` 连接，并且使用单数

### 0.3.2

1. `F` 更改文件上传返回字段
2. `F` `GET admin/users` 和 `GET admin/group/all` 接口过滤 `root` 用户
3. `F` `PUT /admin/user/{id}` 接口不允许修改 `root` 用户的分组

### 0.3.1

1. `F` 更新 `lin-mizar` 到 `0.3.2` 版本，路由属性名由 `auth` --> `permission`

### 0.3.0

1. `A` 将模型层抽离核心库进行重构

## Lin CMS 的特点

Lin CMS 的构筑思想是有其自身特点的。下面我们阐述一些 Lin 的主要特点。

#### Lin CMS 是一个前后端分离的 CMS 解决方案

这意味着，Lin 既提供后台的支撑，也有一套对应的前端系统，当然双端分离的好处不仅仅
在于此，我们会在后续提供`NodeJS`和`PHP`版本的 Lin。如果你心仪 Lin，却又因为技术
栈的原因无法即可使用，没关系，我们会在后续提供更多的语言版本。为什么 Lin 要选择
前后端分离的单页面架构呢？

首先，传统的网站开发更多的是采用服务端渲染的方式，需用使用一种模板语言在服务端完
成页面渲染：比如 JinJa2、Jade 等。服务端渲染的好处在于可以比较好的支持 SEO，但作
为内部使用的 CMS 管理系统，SEO 并不重要。

但一个不可忽视的事实是，服务器渲染的页面到底是由前端开发者来完成，还是由服务器开
发者来完成？其实都不太合适。现在已经没有多少前端开发者是了解这些服务端模板语言的
，而服务器开发者本身是不太擅长开发页面的。那还是分开吧，前端用最熟悉的 Vue 写 JS
和 CSS，而服务器只关注自己的 API 即可。

其次，单页面应用程序的体验本身就要好于传统网站。

#### 框架本身已内置了 CMS 常用的功能

Lin 已经内置了 CMS 中最为常见的需求：用户管理、权限管理、日志系统等。开发者只需
要集中精力开发自己的 CMS 业务即可

#### Lin CMS 本身也是一套开发规范

Lin CMS 除了内置常见的功能外，还提供了一套开发规范与工具类。换句话说，开发者无需
再纠结如何验证参数？如何操作数据库？如何做全局的异常处理？API 的结构如何？前端结
构应该如何组织？这些问题 Lin CMS 已经给出了解决方案。当然，如果你不喜欢 Lin 给出
的架构，那么自己去实现自己的 CMS 架构也是可以的。但通常情况下，你确实无需再做出
架构上的改动，Lin 可以满足绝大多数中小型的 CMS 需求。

举例来说，每个 API 都需要校验客户端传递的参数。但校验的方法有很多种，不同的开发
者会有不同的构筑方案。但 Lin 提供了一套验证机制，开发者无需再纠结如何校验参数，
只需模仿 Lin 的校验方案去写自己的业务即可。

还是基于这样的一个原则：Lin CMS 只需要开发者关注自己的业务开发，它已经内置了很多
机制帮助开发者快速开发自己的业务。

#### 基于插件的扩展

任何优秀的框架都需要考虑到扩展。而 Lin 的扩展支持是通过插件的思想来设计的。当你
需要新增一个功能时，你既可以直接在 Lin 的目录下编写代码，也可以将功能以插件的形
式封装。比如，你开发了一个文章管理功能，你可以选择以插件的形式来发布，这样其他开
发者通过安装你的插件就可以使用这个功能了。毫无疑问，以插件的形式封装功能将最大化
代码的可复用性。你甚至可以把自己开发的插件发布，以提供给其他开发者使用。这种机制
相当的棒。

#### 前端组件库支持

Lin 还将提供一套类似于 Vue Element 的前端组件库，以方便前端开发者快速开发。相比
于 Vue Element 或 iView 等成熟的组件库，Lin 所提供的组件库将针对 Lin CMS 的整体
设计风格、交互体验等作出大量的优化，使用 Lin 的组件库将更容易开发出体验更好的
CMS 系统。当然，Lin 本身不限制开发者选用任何的组件库，你完全可以根据自己的喜好/
习惯/熟悉度，去选择任意的一个基于 Vue 的组件库，比如前面提到的 Vue Element 和
iView 等。你甚至可以混搭使用。当然，前提是这些组件库是基于 Vue 的。

#### 完善的文档

我们将提供详尽的文档来帮助开发者使用 Lin
