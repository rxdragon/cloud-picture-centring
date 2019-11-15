const getters = {
  visitedViews: state => state.tagsView.visitedViews, // 访问页面
  cachedViews: state => state.tagsView.cachedViews, // 缓存页面
  permission_routes: state => state.permission.routes,
  userInfo: state => state.user, // 用户信息
  staffId: state => state.user.id, // 当前用户id
  nickname: state => state.user.nickname, // 昵称
  name: state => state.user.name, // 真名
  loadRoutes: state => state.setting.loadRoutes, // 加载路由加载表
  showCat: state => state.setting.showCat, // 是否显示猫
  showOverTag: state => state.setting.showOverTag, // 是否已上传照片进行标记
  imgUploadDomain: state => state.setting.imgUploadDomain, // 上传后的照片域名
  imgDomain: state => state.setting.imgDomain, // 上传后的照片域名
  updateDomain: state => state.setting.updateDomain, // 上传后的照片域名
  returnStreamId: state => state.notification.returnStreamId, // 退单id
  showAnniversary: state => state.notification.showAnniversary // 显示弹框
}

export default getters
