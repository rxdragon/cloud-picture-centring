<template>
  <div class="cloud-report" v-loading="loading">
    <el-tabs v-model="tabKey">
      <el-tab-pane
        v-for="tab in tabList"
        :label="tab.name"
        :name="tab.name"
        :key="tab.name"
      ></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>

export default {
  name: 'CloudReport',
  data () {
    return {
      tabList: [
        {
          key: 'personal',
          name: '个人',
        },
        {
          key: 'group',
          name: '修图组'
        }]
    }
  }
}
</script>
