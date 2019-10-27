import axios from '@/plugins/axios.js'
import { keyToHump, transformPercentage, getAvg } from '../utils/index.js'
import { SearchType } from '@/utils/enumerate.js'

/**
 * @description 获取审核指标
 * @param {*} params
 */
export function getGroupReviewQuota (params) {
  const timeSpan = [params.startAt, params.endAt]
  return axios({
    url: '/project_cloud/reviewLeader/getGroupReviewQuota',
    method: 'GET',
    params
  }).then(msg => {
    const data = keyToHump(msg)
    console.log(data)
    const tableDataCount = [{
      label: '审核单量',
      value: data.reviewerReviewStreamNum,
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan + '&searchType=' + SearchType.CheckPlant
    }, {
      label: '审核张数',
      value: data.reviewerReviewPhotoNum
    }, {
      label: '审核平均用时',
      value: getAvg(data.reviewTimeAvg.sum, data.reviewTimeAvg.count),
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan
    }, {
      label: '审核种草(张) / 种草率(%)',
      value: data.reviewPhotoPlantNum + ' / ' + transformPercentage(data.reviewPhotoPlantNum, data.reviewPhotoNum),
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan + '&searchType=' + SearchType.CheckPlant,
      query: SearchType.CheckPlant
    }, {
      label: '审核拔草(张) / 拔草率(%)',
      value: data.reviewPhotoPullNum + ' / ' + transformPercentage(data.reviewPhotoPullNum, data.reviewPhotoNum),
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan + '&searchType=' + SearchType.CheckPull,
      query: SearchType.CheckPull
    }, {
      label: '抽查种草(张) / 种草率(%)',
      value: data.spotCheckPhotoPlantNum + ' / ' + transformPercentage(data.spotCheckPhotoPlantNum, data.spotCheckPhotoNum),
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan + '&searchType=' + SearchType.SpotPlant,
      query: SearchType.SpotPlant
    }, {
      label: '抽查拔草(张) / 拔草率(%)',
      value: data.spotCheckPhotoPullNum + ' / ' + transformPercentage(data.spotCheckPhotoPullNum, data.spotCheckPhotoNum),
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan + '&searchType=' + SearchType.SpotPull,
      query: SearchType.SpotPull
    }]
    const tableDataRate = [{
      label: '纠偏意见不同单位：(张 / %)',
      value: data.rectifyDifferentPhotoNum + ' / ' + transformPercentage(data.rectifyDifferentPhotoNum, data.spotCheckPhotoNum),
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan + '&searchType=' + SearchType.RectifyDifferent,
      query: SearchType.RectifyDifferent
    }, {
      label: '纠偏意见不同-种草单位：(张 / %)',
      value: data.rectifyDifferentPlantPhotoNum + ' / ' + transformPercentage(data.rectifyDifferentPlantPhotoNum, data.spotCheckPhotoNum),
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan + '&searchType=' + SearchType.RectifyPlant,
      query: SearchType.RectifyPlant
    }, {
      label: '纠偏意见不同-拔草单位：(张 / %)',
      value: data.rectifyDifferentPullPhotoNum + ' / ' + transformPercentage(data.rectifyDifferentPullPhotoNum, data.spotCheckPhotoNum),
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan + '&searchType=' + SearchType.RectifyPull,
      query: SearchType.RectifyPull
    }, {
      label: '纠偏意见不同-不种不拔单位：(张 / %)',
      value: data.rectifyDifferentNoGrassPhotoNum + ' / ' + transformPercentage(data.rectifyDifferentNoGrassPhotoNum, data.spotCheckPhotoNum),
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan + '&searchType=' + SearchType.RectifyNone,
      query: SearchType.RectifyNone
    }, {
      label: '纠偏意见相同单位：(张 / %)',
      value: data.rectifySamePhotoNum + ' / ' + transformPercentage(data.rectifySamePhotoNum, data.spotCheckPhotoNum),
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan + '&searchType=' + SearchType.RectifySame,
      query: SearchType.RectifySame
    }]
    const createData = {
      tableDataCount,
      tableDataRate
    }
    return createData
  })
}

/**
 * @description 获取历史记录
 * @param {*} params
 */
export function getReviewList (params) {
  return axios({
    url: '/project_cloud/reviewLeader/getReviewList',
    method: 'GET',
    params
  }).then(msg => {
    console.log(msg)
    msg.list.forEach(listItem => {
      // 调试
      const allTime = (listItem.retouch_time + listItem.review_return_rebuild_time) / 60
      listItem.retouchAllTime = allTime.toFixed(2) + 'min'
      listItem.staffName = listItem.retoucher && listItem.retoucher.name || '-'
      listItem.reviewPhoto = listItem.reviewPlantPhotoNum && listItem.reviewPullPhotoNum ? listItem.reviewPlantPhotoNum + ' / ' + listItem.reviewPullPhotoNum : '0 / 0'
      listItem.checkPhoto = listItem.spotCheckPhotoPlantNum + ' / ' + listItem.spotCheckPhotoPullNum
    })
    return msg
  })
}

