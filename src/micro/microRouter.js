const microRouter = [
  {
    name: "RetoucherCenter",
    path: '/micrApp/micro-app-vue/',
    meta: {
      icon: "iconfont iconcurrent",
      title: "修图师中心"
    },
    alwaysShow: true,
    children: [
      {
        
        name: 'Home',
        path: 'home',
        meta: {
          icon: '',
          title: '首页'
        }
      },
      {
        
        name: 'List',
        path: 'list',
        meta: {
          icon: '',
          title: '列表页'
        }
      }
    ]
  }
]

export default microRouter
