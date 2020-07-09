<template>
  <div class="list-tabel" :style="gridStyle">
    <div v-if="header" class="title-header">{{ header }}</div>
    <div v-for="(listItem, listIndex) in listdata" :key="listIndex" class="list-box">
      <el-popover v-if="listItem.labelDesc" placement="left" trigger="hover">
        <div class="tip-content">
          <p>{{ listItem.labelDesc }}</p>
        </div>
        <div class="cursor-point title" slot="reference">{{ listItem.label }}</div>
      </el-popover>
      <div v-else class="title">{{ listItem.label }}</div>
      <div class="content">
        <el-link
          v-if="listItem.componentSwitch"
          type="primary"
          class="el-router-link"
          @click="componentChange(listItem)"
        >
          {{ listItem.value }}
        </el-link>
        <template v-else-if="!listItem.link">
          <div class="content-text" v-html="isTwoData(listItem.value)" />
        </template>
        <router-link v-else :to="listItem.link">{{ listItem.value }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListTable',
  props: {
    listdata: { type: [Array, Object], default: () => [] }, // 列表数据
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
      const length = (this.listdata instanceof Array)
        ? this.listdata.length
        : Object.keys(this.listdata).length
      styleString = `grid-template-columns: repeat(${length}, 1fr);`
      if (this.width) {
        styleString += `width: ${this.width}`
      }
      return styleString
    }
  },
  methods: {
    /**
     * @description 判断是否是数组信息
     */
    isTwoData (value) {
      const isArray = Array.isArray(value)
      if (isArray) {
        let htmlText = ''
        value.forEach(item => {
          htmlText += `<span class="row-item">${item}</span>`
        })
        return htmlText
      }
      return value
    },
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

.list-tabel {
  display: grid;
  text-align: center;
  border-bottom: 1px solid #f2f6fc;

  .title-header {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fafafa;
  }

  .list-box {
    display: flex;
    flex-direction: column;
  }

  .title {
    display: flex;
    align-items: center;
    height: 100%;
    max-height: 78px;
    padding: 17px 20px;
    font-family: @pingFang;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    color: #303133;
    text-align: left;
    background-color: #f2f2f2;
  }

  .content {
    height: 58px;
    padding: 21px 20px;
    font-size: 14px;
    text-align: left;
    background-color: #fff;

    .content-text {
      display: flex;
      flex-wrap: wrap;
    }

    .el-router-link {
      text-decoration: underline;
    }

    a {
      color: @blue;
    }
  }
}
</style>

<style lang="less">
.list-tabel {
  .row-item {
    display: block;
    width: 100%;
    transform: translateY(-10px);
  }
}
</style>
