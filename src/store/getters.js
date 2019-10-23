const getters = {
  visitedViews: state => state.tagsView.visitedViews, // 访问页面
  cachedViews: state => state.tagsView.cachedViews, // 缓存页面
  permission_routes: state => state.permission.routes,
  userInfo: state => state.user, // 用户信息
  nickname: state => state.user.nickname, // 昵称
  loading: state => state.setting.loading, // 是否加载
  imgUploadDomain: state => state.setting.imgUploadDomain, // 上传后的照片域名
  imgDomain: state => state.setting.imgDomain, // 上传后的照片域名
  updateDomain: state => state.setting.updateDomain // 上传后的照片域名
}

export default getters
