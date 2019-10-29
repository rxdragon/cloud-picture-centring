<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper">
      <router-link
        v-for="(tag, tagIndex) in visitedViews"
        ref="tag"
        :key="tag.path"
        :class="isActive(tag, tagIndex)"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        tag="span"
        class="tags-view-item"
        @click.middle.native="closeSelectedTag(tag)"
        @contextmenu.prevent.native="openMenu(tag,$event)"
      >
        <span class="tab-box">
          {{ tag.title }}
          <span v-if="!tag.meta.affix" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)" />
        </span>

      </router-link>
    </scroll-pane>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">刷新</li>
      <li v-if="!(selectedTag.meta&&selectedTag.meta.affix)" @click="closeSelectedTag(selectedTag)">关闭</li>
      <li @click="closeOthersTags">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<script>
import ScrollPane from './ScrollPane'
import path from 'path'

export default {
  components: { ScrollPane },
  data () {
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      affixTags: [],
      activeTagIndex: 0
    }
  },
  computed: {
    visitedViews () {
      return this.$store.state.tagsView.visitedViews
    },
    routes () {
      return this.$store.state.permission.routes
    }
  },
  watch: {
    $route () {
      this.addTags()
      this.moveToCurrentTag()
    },
    visible (value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  mounted () {
    this.initTags()
    this.addTags()
  },
  methods: {
    /**
     * @description 是否激活
     */
    isActive (route, tagIndex) {
      let classText = ''
      if (route.path === this.$route.path) {
        this.activeTagIndex = tagIndex
        classText += 'active'
      }
      if (tagIndex === this.activeTagIndex - 1) {
        classText += 'isBorderActive-left'
      }
      if (tagIndex === this.activeTagIndex + 1) {
        classText += 'isBorderActive-right'
      }
      return classText
    },
    /**
     * @description 过滤可标记tag
     */
    filterAffixTags (routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    },
    /**
     * @description 是否初始化tag
     */
    initTags () {
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          this.$store.dispatch('tagsView/addVisitedView', tag)
        }
      }
    },
    /**
     * @description 是否添加标签
     */
    addTags () {
      const { name } = this.$route
      if (name) {
        this.$store.dispatch('tagsView/addView', this.$route)
      }
      return false
    },
    /**
     * @description 是否移动标签
     */
    moveToCurrentTag () {
      const tags = this.$refs.tag
      this.$nextTick(() => {
        for (const tag of tags) {
          if (tag.to.path === this.$route.path) {
            this.$refs.scrollPane.moveToTarget(tag)
            // when query is different then update
            if (tag.to.fullPath !== this.$route.fullPath) {
              this.$store.dispatch('tagsView/updateVisitedView', this.$route)
            }
            break
          }
        }
      })
    },
    /**
     * @description 刷新页面
     */
    refreshSelectedTag (view) {
      console.log(view)
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath } = view
        console.log(view)
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          })
        })
      })
    },
    /**
     * @description 关闭当前标签
     */
    closeSelectedTag (view) {
      this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (view.path === this.$route.path) {
          this.toLastView(visitedViews, view)
        }
      })
    },
    /**
     * @description 关闭其他页面
     */
    closeOthersTags () {
      this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      this.$router.push(this.selectedTag)
      this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
        this.moveToCurrentTag()
      })
    },
    /**
     * @description 关闭全部标签
     */
    closeAllTags (view) {
      this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
        if (this.affixTags.some(tag => tag.path === view.path)) {
          return
        }
        this.toLastView(visitedViews, view)
      })
    },
    /**
     * @description 调整到最后的额标签
     */
    toLastView (visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView)
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    },
    /**
     * @description 右击菜单
     */
    openMenu (tag, e) {
      const menuMinWidth = 105
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX + 15 // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }
      this.top = e.clientY
      this.visible = true
      this.selectedTag = tag
    },
    /**
     * @description 关闭右键菜单
     */
    closeMenu () {
      this.visible = false
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";
.tags-view-container {
  height: @tagsHeight;
  width: 100%;
  min-width: @minWidth;
  background: #fff;
  .tags-view-wrapper {
    background: #E4E7ED;

    .tags-view-item {
      display: inline-block;
      background-color: #f2f6fc;
      height: @tagsHeight;
      position: relative;

      &::before {
        content: '';
        display: inline-block;
        width: 1px;
        height: 16px;
        background-color: #C0C4CC;
        position: absolute;
        left: 0;
        top: 10px;
        z-index: 20;
      }

      .tab-box {
        display: inline-block;
        position: relative;
        cursor: pointer;
        line-height: @tagsHeight;
        color: #45454D;
        background: #E4E7ED;
        padding: 0 20px;
        font-size: 12px;
      }

      &:first-of-type {
        .tab-box {
          padding-left: 30px;
        }

         &::before {
           background-color: transparent;
         }
      }

      &.active {
        background-color: #E4E7ED;
        .tab-box {
          background-color: #f2f6fc;
          color: #45454d;
          border-radius: 6px 6px 0 0;
        }

        &::before {
          background-color: transparent;
        }
      }

      &.isBorderActive-left {
        .tab-box {
          border-radius: 0 0 6px 0;
        }
      }

      &.isBorderActive-right {
        .tab-box {
          border-radius: 0 0 0 6px;
        }

        &::before {
          background-color: transparent;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="less">
//reset element css of el-icon-close
.tags-view-wrapper {
  position: relative;

  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;
      &:before {
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
