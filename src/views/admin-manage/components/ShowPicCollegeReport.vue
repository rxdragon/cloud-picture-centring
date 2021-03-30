<template>
  <div class="cloud-report">
    <el-tabs v-model="tabKey">
      <el-tab-pane
        v-for="tab in tabList"
        :label="tab.name"
        :name="tab.key"
        :key="tab.key"
      ></el-tab-pane>
    </el-tabs>
    <el-divider class="divider"></el-divider>
    <div class="content">
      <PersonalCloudReport v-if="tabKey === 'personal'" :search-role="CLOUD_ROLE.OPERATE" :search-type="GRADE_LABEL_TYPE.SHOW_PIC"/>
      <GroupCloudReport v-if="tabKey === 'group'" :search-role="CLOUD_ROLE.OPERATE" :search-type="GRADE_LABEL_TYPE.SHOW_PIC" />
    </div>
  </div>
</template>

<script>
// 运营云端修图报告
import PersonalCloudReport from '@/components/CloudReport/PersonalCloudReport'
import GroupCloudReport from '@/components/CloudReport/GroupCloudReport'
import { CLOUD_ROLE, GRADE_LABEL_TYPE } from '@/utils/enumerate'

export default {
  name: 'CloudCollegeReport',
  components: { PersonalCloudReport, GroupCloudReport },
  data () {
    return {
      CLOUD_ROLE,
      GRADE_LABEL_TYPE,
      tabList: [
        {
          key: 'personal',
          name: '个人',
        },
        {
          key: 'group',
          name: '修图组'
        }
      ],
      tabKey: 'personal'
    }
  },
}
</script>

<style lang="less" scoped>
.divider {
  margin: 1px 0 24px 0;
}

.cloud-report {
  & /deep/ .el-tabs__item {
    &.is-active {
      &::before {
        content: none !important;
      }

      &::after {
        content: none !important;
      }
    }

    &.is-active + .el-tabs__item {
      &::before {
        content: none !important;
      }

      &::after {
        content: none !important;
      }
    }
  }
}
</style>
