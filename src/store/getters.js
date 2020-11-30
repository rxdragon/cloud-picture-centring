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
  webSocketState: state => state.user.webSocketState, // webscoket 状态
  loadRoutes: state => state.setting.loadRoutes, // 加载路由加载表
  showCat: state => state.setting.showCat, // 是否显示猫
  showOverTag: state => state.setting.showOverTag, // 是否已上传照片进行标记
  cacheImageSwitch: state => state.setting.cacheImageSwitch, // 是否开启自动上传
  guestInfiniteScroll: state => state.setting.guestInfiniteScroll, // 是否开启自动上传
  saveFolder: state => state.setting.savePath, // 保存路径
  imgUploadDomain: state => state.setting.imgUploadDomain, // 上传后的照片域名
  imgDomain: state => state.setting.imgDomain, // 上传后的照片域名
  imgCompressDomain: state => state.setting.imgCompressDomain, // 上传后自动压缩图域名
  updateDomain: state => state.setting.updateDomain, // 上传后的照片域名
  retouchId: state => state.notification.retouchId, // 修图id
  showAnniversary: state => state.notification.showAnniversary, // 显示弹框
  roles: state => state.permission.roles, // 全部权限
  downloadList: state => state.downloadlist.downloadList // 下载完成列表
}

const settting = {
  showRecord: state => state.setting.showRecord, // 是否显示修图师修图数据
}

const permissionGetters = {
  isRetoucher: state => state.permission.isRetoucher, // 是否是修图师身份
  // 云端绩效信息相关
  showPartnerPerformance: state => state.permission.showPartnerPerformance, // 是否显示伙伴绩效
  showOverallPerformance: state => state.permission.showOverallPerformance, // 是否显示总体绩效
  showWorkInfo: state => state.permission.showWorkInfo, // 是否显示工作看板
  showAuditPerformance: state => state.permission.showAuditPerformance, // 是否显示审核绩效
  showTimeStatistics: state => state.permission.showTimeStatistics, // 是否显示用时统计
  showRetoucherChargeBackReport: state => state.permission.showRetoucherChargeBackReport, // 退单统计
  showCloudCollegeReport: state => state.permission.showCloudCollegeReport, // 云学院报告
  showRetoucherGroupPerformance: state => state.permission.showRetoucherGroupPerformance, // 是否显示用时统计
  showCheckerEvaluate: state => state.permission.showCheckerEvaluate, // 是否显示看片评价
  showFlowInfo: state => state.permission.showCheckerEvaluate, // 是否显示流量看板按钮
  // 云端工作看板
  showRetouchStreamList: state => state.permission.showRetouchStreamList, // 是否显示修图队列
  showReviewStreamList: state => state.permission.showReviewStreamList, // 是否显示审核队列
  showStreamList: state => state.permission.showStreamList, // 是否显示流水管理
  showUrgentStream: state => state.permission.showUrgentStream, // 是否可以加急
  // 云学院
  showSpotRecheck: state => state.permission.showSpotRecheck, // 是否显示重新打分按钮
  showEmptyCheckPool: state => state.permission.showEmptyCheckPool, // 是否显示重新打分按钮
  // 自动修图
  canAutoRetouch: state => state.permission.canAutoRetouch, // 是否显示自动修图按钮
  autoBuffingA: state => state.permission.autoBuffingA, // 是否显示自动修图磨皮A按钮
  autoBuffingB: state => state.permission.autoBuffingB, // 是否显示自动修图磨皮B按钮
  // 申诉处理
  showAppealAccess: state => state.permission.showAppealAccess, // 是否显示我要申诉入口
  showFirstExamine: state => state.permission.showFirstExamine, // 是否显示初审按钮
  showSecondExamine: state => state.permission.showSecondExamine, // 是否显示复审按钮
  // 在线看片
  isOnlineWatcher: state => state.permission.isOnlineWatcher, // 是否在线看片师
  // 账号管理
  showAddStaff: state => state.permission.showAddStaff, // 账号配置是否显示添加按钮
  showDisableStaff: state => state.permission.showDisableStaff, // 账号配置是否显示禁用按钮
  showEnableStaff: state => state.permission.showEnableStaff, // 账号配置是否显示启用按钮
  showEditStaff: state => state.permission.showEditStaff // 账号配置是否显示编辑按钮
}

const getters = {
  ...defaultGetters,
  ...permissionGetters,
  ...settting
}

export default getters
