<template>
  <div class="list-scroll" @scroll="handleScroll">
    <ul
      :style="{
        paddingTop: lineTopHeight + 'px',
        paddingBottom: lineBottomHeight + 'px'
      }"
    >
      <li
        v-for="(item, index) in previewList"
        :key="index"
        :style="{
          height: height + 'px'
        }"
      >
        <slot :data="item" />
      </li>
    </ul>
    <div
      v-if="hasMoreData"
      :style="{
        height: distance + 'px'
      }"
      class="load-more-gif"
    >loading...</div>
  </div>
</template>

<script>

export default {
  name: 'ListScroll',
  components: {},
  props: {
    list: {
      type: Array,
      required: true,
      default: () => [],
      twoWays: true
    },
    height: { type: Number, default: 44 },
    listHeight: { type: Number, default: 200 },
    canScroll: { type: Boolean, default: true },
    dispatchData: { type: Function, default: () => {} },
    loadMoreData: { type: Function, required: true },
    page: { type: Number, default: 1 }
  },
  data () {
    return {
      lastScrollTop: null, // 滚动完一次做一级最后的节点记录
      distance: 44, // 触发异步加载区域
      lineTopHeight: 0,
      lineBottomHeight: 0,
      canLoadmore: true,
      previewList: [],
      displayCount: 0, // 已经滑过的元素
      hasMoreData: true,
      to: 0, // 下一个展示节点
      from: 0 // 上一展示接待你
    }
  },
  watch: {
    listHeight: {
      handler: function (value) {
        this.initData()
        this.handleScroll()
      }
    },
    list () {
      if (this.page === 1) {
        this.$el.scrollTop = 0
        this.initData()
        this.handleScroll()
      }
    }
  },
  mounted () {
    this.initData()
    this.handleScroll()
  },
  methods: {
    initData () {
      // init all data
      this.lastScrollTop = null
      this._rowsInWindow = Math.ceil(this.$el.offsetHeight / this.height) // 显示窗口展示的行数
      this._above = this._rowsInWindow * 2 // 列表上面的元素
      this._below = this._rowsInWindow // 屏幕下面的元素
      this._max = this._rowsInWindow * this.height // 显示区域最大高度
      if (!this.list.length) { this.hasMoreData = false }
      // console.log(this._rowsInWindow, '_rowsInWindow')
      // console.log(this._above, '_above')
      // console.log(this._below, '_below')
      // console.log(this._max, '_max')
    },
    handleScroll () {
      const _scrollTop = this.$el.scrollTop // 滚动条高度
      // 已经滑过后的元素
      // console.log(_scrollTop)
      this.displayCount = this.getDisplayCount(_scrollTop)
      // 是否滚动了一个可视区域
      const isScrollOneVisibleArea = Math.abs(_scrollTop - this.lastScrollTop) >= this._max
      if (this.lastScrollTop === null || isScrollOneVisibleArea) {
        this.lastScrollTop = _scrollTop
      } else {
        this.judgeLoadMore()
        return
      }
      // 滚动一个可是区域时触发
      // 获取下一个渲染to和from index
      this.getFromAndToIndex()
      // set top height and bottom height
      this.setPadding()
      // 发送信息
      if (typeof this.dispatchData === 'function') { this.dispatchData(this) }
      // console.log(this.from, this.to)
      this.resetPreviewList(this.from, this.to)
      this.$nextTick(() => { this.judgeLoadMore() })
    },
    /**
     * @description 异步加载
     */
    async loadmore (from, to) {
      if (!this.canLoadmore) return
      console.log(this.canLoadmore, 'this.canLoadmore')
      this.canLoadmore = false
      const data = await this.loadMoreData()
      // console.log(data, 'loadmore')
      if (!data.length) {
        this.hasMoreData = false
        return
      }
      const _to = to + this._below
      // console.log(this.from, from, 'from')
      // console.log(to, _to, 'loadmore')
      // console.log(this.list.length - _to)
      this.resetPreviewList(from, _to)
      this.lineBottomHeight = (this.list.length - _to) * this.height
      this.handleScroll()
      this.canLoadmore = true
    },
    /**
     * @description 渲染组件
     */
    resetPreviewList (from, to) {
      const _scrollTop = this.$el.scrollTop
      const isLoadingMoveUp = _scrollTop < this.lastScrollTop
      if (isLoadingMoveUp) return
      // console.log(_scrollTop, this.lastScrollTop)
      this.previewList = []
      for (let i = from; i < to; i++) {
        this.previewList.push(this.list[i])
      }
    },
    /**
     * @description 判断是否能异步加载
     */
    judgeLoadMore () {
      const _scrollTop = this.$el.scrollTop // 滚动条高度
      const _height = this.$el.querySelectorAll('ul')[0].offsetHeight // 滚动元素高度
      const _contentHeight = this.$el.offsetHeight // 可是区域高度
      const isScollFinish = this.to === this.list.length
      const scollApartBottom = _height - _scrollTop - _contentHeight // 滚动元素距离底部的距离
      const isArriveArea = scollApartBottom < this.distance
      // console.log(isScollFinish, scollApartBottom, 'scollApartBottom')
      if (isScollFinish && isArriveArea && this.canScroll) { this.loadmore(this.from, this.to) }
    },
    /**
     * @description 获取隐藏的加载元素
     */
    getDisplayCount (scrollTop) {
      const upglideRowCount = scrollTop / this.height
      return parseInt(upglideRowCount)
    },
    /**
     * @description 设置滚动元素padding
     */
    setPadding () {
      this.lineTopHeight = this.from * this.height // 顶部padding
      // console.log(this.list.length - this.to, 'setPadding')
      this.lineBottomHeight = (this.list.length - this.to) * this.height // 底部padding
    },
    /**
     * @description 获取展示from和toIndex
     */
    getFromAndToIndex () {
      let _from = this.displayCount - this._above
      if (_from < 0) { _from = 0 }
      let _to = _from + this._above + this._below + this._rowsInWindow
      if (_to > this.list.length) { _to = this.list.length }
      this.from = _from
      this.to = _to
    }
  }
}
</script>

<style lang="less">
.list-scroll {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  ul {
    margin: 0;
    padding: 0;

    li {
      text-decoration: none;
      font-size: 14px;
      line-height: 3;
      text-align: left;
      box-sizing: border-box;
      background: #fff;

      &.line-top,
      &.line-bottom {
        border-bottom: 0;
      }
    }
  }

  .load-more-gif {
    width: 100%;
    height: 44px;
    text-align: center;
    line-height: 44px;
    background: #fff;
    border-top: none;
    color: #48b884;
  }
}
</style>
