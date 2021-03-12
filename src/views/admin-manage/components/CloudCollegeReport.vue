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

    <div class="content">
      <personal-cloud-report v-if="tabKey === 'personal'"></personal-cloud-report>
      <group-cloud-report v-if="tabKey === 'group'"></group-cloud-report>
    </div>
  </div>
</template>

<script>
// 运营云端修图报告
import PersonalCloudReport from '@/components/CloudReport/personal-cloud-report'
import GroupCloudReport from '@/components/CloudReport/group-cloud-report'
import { CLOUD_ROLE } from '@/utils/enumerate'

export default {
  name: 'CloudCollegeReport',
  components: { PersonalCloudReport, GroupCloudReport },
  data () {
    return {
      CLOUD_ROLE,
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
      tabKey: 'group'
    }
  },
}
</script>

<style lang="less" scoped>

.content {
  margin-top: 20px;
}
</style>
