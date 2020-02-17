# cloud-picture-centring

## 项目起始
```
yarn install --ignore-optional
```

### 开启服务
```
yarn eserve-dev
```

### 构建项目
```
yarn run build
```

### eslint
```
yarn run lint
```

### 项目结构

```
├─ public                       // 公共内容
│    ├─ icon.ico 
│    ├─ icon.png                // 图标
│    └─ index.html
├─ src                          // 源代码
│    ├─ App.vue
│    ├─ api // 所有请求
│    │    ├─ accountManage.js   // 账号配置模块请求
│    │    ├─ adminManage.js     // 运营工作管理模块请求
│    │    ├─ assessmentCenter.js// 评价中心模块请求
│    │    ├─ commonality.js     // 公共请求
│    │    ├─ guestPhoto.js      // 客片池模块请求
│    │    ├─ institution.js     // 机构管理模块请求
│    │    ├─ operationManage.js // 操作相关请求
│    │    ├─ product.js         // 产品相关请求
│    │    ├─ retouchLeader.js   // 个人中心组长模块请求
│    │    ├─ retoucher.js       // 修片师个人相关请求
│    │    ├─ retoucherCenter.js // 修片师中心模块请求
│    │    ├─ reviewCheck.js     // 个人中心（审核组长）模块请求
│    │    ├─ reviewer.js        // 审核师从相关请求
│    │    ├─ staff.js           // 伙伴相关请求
│    │    ├─ user.js            // 用户相关请求
│    │    └─ workManage.js      // 云端工作指标模块请求
│    ├─ assets                  // 静态资源文件
│    │    ├─ 404_images
│    │    ├─ config
│    │    ├─ mock
│    │    ├─ sand_clock
│    │    └─ sprites.png
│    ├─ background.js       // electron配置
│    ├─ components          // 组件
│    │    ├─ Breadcrumb     // 面包屑组件
│    │    ├─ DatePicker     // 日期选择组件
│    │    ├─ Jurisdiction   // 权限模块组件 
│    │    ├─ LinkageSelect  // 修图标准选择组件
│    │    ├─ ListTable      // 报告表格组件
│    │    ├─ OrderInfo      // 订单详情组件
│    │    ├─ PhotoBox       // 照片盒子组件
│    │    ├─ PhotoList      // 照片列表组件
│    │    ├─ PreviewPhoto   // 预览照片组件
│    │    ├─ ProductPanel   // 产品穿梭框添加组件
│    │    ├─ SelectBox      // 下拉选择组件
│    │    ├─ StaffInfo      // 员工详情组件
│    │    ├─ StaffPanel     // 员工穿梭框添加组件
│    │    └─ TransferExten  // 穿梭框选择组件
│    ├─ directive           //自定义指令
│    │    ├─ index.js 
│    │    ├─ limit-decimal  // 小数限制指令
│    │    ├─ limit-length   // 长度限制指令
│    │    └─ limit-num      // 数字限制指令
│    ├─ filters
│    │    └─ index.js       // 过滤器
│    ├─ guards.js           // 路由守卫
│    ├─ layout              // 布局
│    │    ├─ components     // 布局常用组件
│    │    └─ index.vue      // 布局文件
│    ├─ main.js
│    ├─ plugins             // 插件
│    │    ├─ axios.js       // axios请求方法
│    │    ├─ element.js
│    │    ├─ errorCode.js   // 错误码
│    │    ├─ icon-font      // 图标
│    │    └─ individuation-element-ui
│    ├─ router              
│    │    ├─ index.js       // 路由
│    │    └─ modules        // 路由模块
│    ├─ store
│    │    ├─ getters.js     // vuex获取函数
│    │    ├─ index.js
│    │    └─ modules        // vuex模块
│    ├─ styles              // 样式文件
│    │    ├─ index.less
│    │    ├─ lessmap.less
│    │    ├─ nprogress.less
│    │    ├─ sidebar.less
│    │    ├─ transition.less
│    │    └─ variables.less     // less变量声明
│    ├─ utils                   // 工具
│    │    ├─ enumerate.js       // 常用枚举数据
│    │    ├─ get-page-title.js  // 取得标题
│    │    ├─ index.js
│    │    ├─ photoTool.js       // 照片工具
│    │    ├─ sessionTool.js     // session更改方法    
│    │    ├─ timespan.js
│    │    └─ validate.js        // 验证工具
│    └─ views
│           ├─ account-manage                   // 账号配置
│           ├─ admin-configuration              // 云端运营配置
│           ├─ admin-manage                     // 云端工作管理
│           ├─ assessment-center                // 评价中心
│           ├─ audit-center                     // 审核中心
│           ├─ error-page                       // 错误引导页面
│           ├─ guest-photo                      // 客片池
│           ├─ home                             // 主页
│           ├─ institution-manage               // 机构管理
│           ├─ login                            // 登录
│           ├─ order-detail                     // 订单详情
│           ├─ personal-center-audit            // 个人中心（审核专员）
│           ├─ personal-center-audit-leader     // 个人中心（审核组长）
│           ├─ personal-center-retoucher        // 个人中心（修图专员）
│           ├─ personal-center-retoucher-leader // 个人中心（审核组长）
│           ├─ redirect                         // 重定向
│           └─ retoucher-center                 // 修图师中心
├─ vue.config.js
│   ├── App.vue                // 入口页面
│   ├── main.js                // 入口 加载组件 初始化等
│   └── permission.js          // 权限管理
├── eslintrc.js                // eslint 配置项
├── .gitignore                 // git 忽略项
├── favicon.ico                // favicon图标
└── package.json               // package.json
```
