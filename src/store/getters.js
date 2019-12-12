const defaultGetters = {
  visitedViews: state => state.tagsView.visitedViews, // 访问页面
  cachedViews: state => state.tagsView.cachedViews, // 缓存页面
  permission_routes: state => state.permission.routes,
  personage_routers: state => state.permission.personageRouters, // 个人有的路由
  userInfo: state => state.user, // 用户信息
  staffId: state => state.user.id, // 当前用户id
  nickname: state => state.user.nickname, // 昵称
  lineState: state => state.user.lineState, // 用户在线状态
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

const permissionGetters = {
  showPartnerPerformance: state => state.permission.showPartnerPerformance, // 是否显示伙伴绩效
  showOverallPerformance: state => state.permission.showOverallPerformance, // 是否显示总体绩效
  showAuditPerformance: state => state.permission.showAuditPerformance, // 是否显示审核绩效
  showTimeStatistics: state => state.permission.showTimeStatistics, // 是否显示用时统计
  showCheckerEvaluate: state => state.permission.showCheckerEvaluate, // 是否显示看片评价
  showFlowInfo: state => state.permission.showCheckerEvaluate, // 是否显示流量看板按钮
  showRetouchStreamList: state => state.permission.showRetouchStreamList, // 是否显示流量看板按钮
  showReviewStreamList: state => state.permission.showReviewStreamList, // 是否显示流量看板按钮
  showStreamList: state => state.permission.showStreamList, // 是否显示流量看板按钮
  showUrgentStream: state => state.permission.showUrgentStream // 是否显示流量看板按钮
}

const getters = {
  ...defaultGetters,
  ...permissionGetters
}

export default getters
