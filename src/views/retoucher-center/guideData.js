export default [
  {
    element: '#todayEarning',
    popover: {
      title: '今日获得收益',
      description: '云端审核通过且35点海草后（不包含35点），开始计算，不包含负收益',
      position: 'top'
    }
  },
  {
    element: '#todayLose',
    popover: {
      title: '今日负收益',
      description: '今日看片师质量问题退单或者【不在线退单】导致扣除收益，可能是非今日修图订单',
      position: 'top'
    }
  },
]
