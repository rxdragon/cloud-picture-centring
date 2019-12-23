const version_2_2_0 = {
  title: '2.2.0',
  desc: `> 版本概况

  * 修图师在线功能
  * 门店退单功能
  * 直接审核功能
  * 顾客满意度显示
  * 优化部分功能
  * 修复部分bug
  
  > 综合改动
  
  * 窗口
      1. <span class="mark-opt">优化</span>默认开启窗口大小由1400\*800改为1400\*900
  * 下载管理器
      1. <span class="mark-fix">修复</span>打开下载管理器，下载完成标记数字不会减少的问题
  * 修图详情页面
      1. <span class="mark-new">新增</span>如果门店退回显示**门店退回**原因信息
      2. <span class="mark-new">新增</span>顾客满意度评价信息
      3. <span class="mark-new">新增</span>照片版本显示，新增门店退回成片和修图师最新修后成片（看片完成显示）
      4. <span class="mark-opt">优化</span>更改门店评价布局
  
  > 修图师
  
  * 状态栏
      1. <span class="mark-new">新增</span>在线离线功能，点击头像可以主动上线和下线（当前账号有订单是不能下线）
      2. 退出登录，如果当前有订单不能退出登录
  * 待修订单页面
      1. <span class="mark-new">新增</span>接单列表，如果门店退单，显示**门店退单**标签
      2. <span class="mark-new">新增</span>修图详情，照片信息，流水号增加**门店退单**标签
      3. <span class="mark-new">新增</span>排队接单，超时**10分钟**为接到订单，会弹出弹框确认是否在线功能，如果弹框**3分钟**为确认，会自动下线，并退出排队
      4. **新增，优化**门店退回，审核退回，由显示有退回标记的照片改为显示最新退回的照片
      5. <span class="mark-new">新增</span>照片信息，显示门店退回原因和门店退回备注
      6. <span class="mark-opt">优化</span>照片信息，**退回原因**改为**审核退回备注**
      7. <span class="mark-opt">优化</span>获取收益数据，如果收益为0，由原来橙色显示为灰色
      8. <span class="mark-opt">优化</span>修图上传，验证照片原始格式是否和照片后缀名相同（防止ps保存失败，只更改了**psd**后缀名的问题，目前只支持上传**jpg**,**png**格式）
      9. <span class="mark-fix">修复</span>自动选中上传，读取照片读取一半的问题
  
  * 通知
      1. <span class="mark-new">新增</span>退单通知，进行划分为门店退单和审核退单
  
  * 修图历史记录
      1. <span class="mark-new">新增</span>列表显示顾客满意度项
  
  > 审核专员
  
  * 修图审核页面
      1. <span class="mark-new">新增</span>照片信息，门店退回显示**门店退回**标记
      2. <span class="mark-new">新增</span>单张照片信息，门店退回显示**门店退回原因**和**门店退回备注**
      3. <span class="mark-opt">优化</span>单张照片信息，**退回原因**改为**审核退回备注**
  
  > 云端运营
  
  * 值班主管配置<span class="mark-new">新增</span>
      1. <span class="mark-new">新增</span>值班主管配置
  
  > 云端工作管理
  
  * 云端工作看板
  
      1. <span class="mark-new">新增</span>直接审核，会绑定到当前账号上，审核人，有且只能接一单（不包含重修订单)，有直接审核权限后，并且在审核队列中显示
      2. <span class="mark-opt">优化</span>加急管理版块的标题有**加急管理**改为**流水管理**
      3. <span class="mark-opt">优化</span>操作按钮交互由全部显示按钮，更改为下拉菜单
  
  * 伙伴绩效
  
      1. <span class="mark-new">新增</span>顾客满意度显示
      2. <span class="mark-new">新增</span>门店退单单数，门店退单张数等各项数据
      3. <span class="mark-opt">优化</span>数据可视化
  
  * 看片评价
  
      1. <span class="mark-new">新增</span>列表顾客满意度显示`
}

const version_2_2_1 = {
  title: '2.2.1',
  desc: `> 版本概况

  * 修图师在线功能
  
  > 修图师
  
  * 待修订单页面
    1. <span class="mark-opt">优化</span>排队接单中，不会自动退出排队和提示排队弹框
  
  * 修图历史记录
      1. <span class="mark-fix">修复</span>查询种草数据不能翻页问题
  
  * 冲量奖
      1. <span class="mark-fix">修复</span>由原来大于特定海草值更改为大于等于该目标海草`
}

export default [
  version_2_2_1,
  version_2_2_0
]
