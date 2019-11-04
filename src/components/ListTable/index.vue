<template>
  <div class="list-tabel" :style="gridStyle">
    <div v-if="header" class="title-header">{{ header }}</div>
    <div v-for="(listItem, listIndex) in listdata" :key="listIndex" class="list-box">
      <div class="title">{{ listItem.label }}</div>
      <div class="content">
        <el-link v-if="listItem.componentSwitch" type="primary" @click="componentChange(listItem)">{{ listItem.value }}</el-link>
        <template v-else-if="!listItem.link">{{ listItem.value }}</template>
        <router-link v-else :to="listItem.link">{{ listItem.value }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListTable',
  props: {
    listdata: { type: Array, default: () => [] }, // 列表数据
    width: { type: String, default: '' }, // 宽
    isSeachPage: { type: Boolean }, // 是否传递伏组件指
    header: { // 左侧标题头部
      type: String,
      default: ''
    }
  },
  computed: {
    gridStyle () {
      let styleString = ''
      styleString = `grid-template-columns: repeat(${this.listdata.length}, 1fr);`
      if (this.width) {
        styleString += `width: ${this.width}`
      }
      return styleString
    }
  },
  methods: {
    /**
     * @description 更改父级组件
     */
    componentChange (listItem) {
      if (listItem.query) {
        this.$emit('update:searchType', listItem.query)
      }
      this.$emit('update:isSeachPage', true)
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.list-tabel {
  display: grid;
  text-align: center;
  border-bottom: 1px solid #f2f6fc;

  .title-header {
    background-color: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .list-box {
    display: flex;
    flex-direction: column;
  }

  .title {
    background-color: #fafafa;
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFangSC;
    font-weight: 500;
    color: #303133;
    line-height: 22px;
    padding: 17px 20px;
    text-align: left;
    height: 100%;
    max-height: 78px;
    display: flex;
    align-items: center;
  }

  .content {
    padding: 21px 20px;
    font-size: 14px;
    text-align: left;
    height: 58px;
    background-color: #fff;

    a {
      color: @blue;
    }
  }
}
</style>
