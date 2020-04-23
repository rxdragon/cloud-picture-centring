<template>
  <div>
    <div class="header">
      <h3>组员修图报告</h3>
    </div>
     <transition name="fade" mode="out-in">
      <el-tabs v-model="activeName" v-show="isShowTab">
        <el-tab-pane v-for="(item,index) in tabList" :key="index" :label="item.label" :name="item.value" />
      </el-tabs>
    </transition>
    <transition name="fade" mode="out-in">
      <keep-alive>
          <component :is="activeName" @changeShowTab="changeShowTab"/>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
import RetouchReport from './components/RetouchReport'
import AssessmentReport from './components/AssessmentReport'

export default {
  name: 'StaffRetouchReport',
  components: { RetouchReport, AssessmentReport },
  data () {
    return {
      isShowTab: true,
      tabList: [
        { label: '修图报告', value: 'RetouchReport' },
        { label: '云学院报告', value: 'AssessmentReport' }
      ],
      activeName: 'RetouchReport',//  初始化显示修图报告
    }
  },
  methods: {
    changeShowTab (val) {
      this.isShowTab = !val
    }
  }
}
</script>
