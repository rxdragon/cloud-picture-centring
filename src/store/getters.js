const getters = {
  visitedViews: state => state.tagsView.visitedViews, // 访问页面
  cachedViews: state => state.tagsView.cachedViews, // 缓存页面
  permission_routes: state => state.permission.routes,
  personage_routers: state => state.permission.personageRouters, // 个人有的路由
  userInfo: state => state.user, // 用户信息
  staffId: state => state.user.id, // 当前用户id
  nickname: state => state.user.nickname, // 昵称
  name: state => state.user.name, // 真名
  loadRoutes: state => state.setting.loadRoutes, // 加载路由加载表
  showCat: state => state.setting.showCat, // 是否显示猫
  showOverTag: state => state.setting.showOverTag, // 是否已上传照片进行标记
  autoUpload: state => state.setting.autoUpload, // 是否开启自动上传
  saveFolder: state => state.setting.savePath, // 保存路径
  imgUploadDomain: state => state.setting.imgUploadDomain, // 上传后的照片域名
  imgDomain: state => state.setting.imgDomain, // 上传后的照片域名
  updateDomain: state => state.setting.updateDomain, // 上传后的照片域名
  returnStreamId: state => state.notification.returnStreamId, // 退单id
  showAnniversary: state => state.notification.showAnniversary, // 显示弹框
  downloadList: state => state.downloadlist.downloadList // 下载完成列表
}

export default getters
