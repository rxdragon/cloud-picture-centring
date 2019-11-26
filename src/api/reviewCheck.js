import axios from '@/plugins/axios.js'
import { keyToHump, transformPercentage, getAvg, timeFormat } from '../utils/index.js'
import { revertTimeSpan } from '@/utils/timespan.js'
import { SearchType } from '@/utils/enumerate.js'

/**
 * @description 获取审核指标
 * @param {*} params
 */
export function getGroupReviewQuota (params) {
  const timeSpan = [revertTimeSpan(params.startAt), revertTimeSpan(params.endAt, 1)]
  return axios({
    url: '/project_cloud/reviewLeader/getGroupReviewQuota',
    method: 'GET',
    params
  }).then(msg => {
    const data = keyToHump(msg)
    const tableDataCount = [{
      label: '审核单量',
      value: data.reviewerReviewStreamNum,
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan
    }, {
      label: '审核张数',
      value: data.reviewerReviewPhotoNum
    }, {
      label: '审核平均用时',
      value: timeFormat(getAvg(data.reviewTimeAvg.sum, data.reviewTimeAvg.count), 'text', true)
    }, {
      label: '审核种草(张) / 种草率(%)',
      value: data.reviewPhotoPlantNum + ' / ' + transformPercentage(data.reviewPhotoPlantNum, data.reviewerReviewPhotoNum),
      link: '/audit-center/audit-history' + '?timeSpan=' + timeSpan + '&searchType=' + SearchType.CheckPlant,
      query: SearchType.CheckPlant
    }, {
      label: '审核拔草(张) / 拔草率(%)',
      value: data.reviewPhotoPullNum + ' / ' + transformPercentage(data.reviewPhotoPullNum, data.reviewerReviewPhotoNum),
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
    msg.list.forEach(listItem => {
      const reviewPlantPhotoNum = listItem.tags && listItem.tags.values && listItem.tags.values.plant_num || 0
      const reviewPullPhotoNum = listItem.tags && listItem.tags.values && listItem.tags.values.pull_num || 0
      const spotPlantPhotoNum = listItem.tags && listItem.tags.values && listItem.tags.values.film_evaluation_photo_plant_num || 0
      const spotPullPhotoNum = listItem.tags && listItem.tags.values && listItem.tags.values.film_evaluation_photo_pull_num || 0
      const spotSameNum = listItem.tags && listItem.tags.values && listItem.tags.values.rectify_same_photo_num || 0
      const spotDifferentNum = listItem.tags && listItem.tags.values && listItem.tags.values.rectify_different_photo_num || 0
      const allTime = (listItem.review_time + listItem.review_return_rebuild_time)
      listItem.reviewAllTime = timeFormat(allTime, 'text', true)
      listItem.staffName = listItem.reviewers && (listItem.reviewers.name || listItem.reviewers.real_name) || '-'
      listItem.reviewPhoto = reviewPlantPhotoNum + ' / ' + reviewPullPhotoNum
      listItem.checkPhoto = spotPlantPhotoNum + ' / ' + spotPullPhotoNum
      listItem.spotSameNum = spotSameNum
      listItem.spotDifferentNum = spotDifferentNum
    })
    return msg
  })
}

