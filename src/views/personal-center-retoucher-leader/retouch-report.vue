<template>
  <div>
    <div class="header">
      <h3>组员修图报告</h3>
    </div>
    <el-tabs v-model="activeName" v-show="isShowTab">
      <el-tab-pane
        v-for="(item,index) in tabList"
        :key="index"
        :label="item.label"
        :name="item.value"
      />
    </el-tabs>
    <keep-alive>
      <component :is="activeName" @changeShowTab="changeShowTab"/>
    </keep-alive>
  </div>
</template>

<script>
import RetouchStaffReport from './components/RetouchStaffReport'
import AssessmentReport from './components/AssessmentReport'

export default {
  name: 'RetouchReport',
  components: { RetouchStaffReport, AssessmentReport },
  data () {
    return {
      isShowTab: true,
      tabList: [
        { label: '修图报告', value: 'RetouchStaffReport' },
        { label: '云学院报告', value: 'AssessmentReport' }
      ],
      activeName: 'RetouchStaffReport',//  初始化显示修图报告
    }
  },
  methods: {
    changeShowTab (val) {
      this.isShowTab = !val
    }
  }
}
</script>
