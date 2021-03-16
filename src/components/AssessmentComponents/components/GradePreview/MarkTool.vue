<template>
  <div class="mark-tool">
    <!-- 移动 -->
    <div class="tool" :class="{ 'active': drawType === TOOL_TYPE.MOVE }" @click.capture="changeDrawType(TOOL_TYPE.MOVE)">
      <el-tooltip
        class="item"
        effect="dark"
        content="移动"
        placement="top"
      >
        <div class="tool-dom">
          <i id="move" class="el-icon-rank" />
          <span class="shortcut">V</span>
        </div>
      </el-tooltip>
    </div>
    <!-- 画笔 -->
    <div class="tool" :class="{ 'active': drawType === TOOL_TYPE.PEN }" @click="changeDrawType(TOOL_TYPE.PEN)">
      <el-popover
        placement="right-start"
        width="30"
        popper-class="pen-weight"
        trigger="click"
      >
        <div class="pen-list">
          <div
            class="pen-item"
            v-for="penWeightItem in penWeight"
            :key="penWeightItem.label"
            @click="changeLineWidth(penWeightItem)"
          >
            <div
              class="pen-box"
              :class="penWeightItem.active ? penWeightItem.label + ' active' : penWeightItem.label "
            >
            </div>
          </div>
        </div>
        <div slot="reference">
          <el-tooltip
            class="item"
            effect="dark"
            content="画笔"
            placement="top"
          >
            <div class="tool-dom">
              <i id="pen" class="el-icon-edit" />
              <span class="shortcut">B</span>
            </div>
          </el-tooltip>
        </div>
      </el-popover>
    </div>
    <!-- 圆圈 -->
    <div
      class="tool"
      :class="{ 'active': drawType === TOOL_TYPE.ELLIPSE }"
      @click="changeDrawType('ellipse')"
    >
      <el-tooltip
        class="item"
        effect="dark"
        content="圆圈"
        placement="top"
      >
        <div class="tool-dom">
          <div class="circle"></div>
        </div>
      </el-tooltip>
    </div>
    <!-- 直线 -->
    <div class="tool" :class="{ 'active': drawType === TOOL_TYPE.LINE }" @click="changeDrawType(TOOL_TYPE.LINE)">
      <el-tooltip
        class="item"
        effect="dark"
        content="直线"
        placement="top"
      >
        <div class="tool-dom">
          <i id="line" class="el-icon-minus" />
        </div>
      </el-tooltip>
    </div>
    <!-- 放大 -->
    <div
      class="tool"
      :class="{ 'active': drawType === TOOL_TYPE.BLOWUP }"
      @click="changeDrawType('blowup')"
    >
      <el-tooltip
        class="item"
        effect="dark"
        content="放大"
        placement="top"
      >
        <div class="tool-dom">
          <i id="blowup" class="el-icon-search" />
          <span class="shortcut">Z</span>
        </div>
      </el-tooltip>
    </div>
    <!-- 文本 -->
    <div class="tool" :class="{ 'active': drawType === TOOL_TYPE.TEXT }" @click.capture="changeDrawType(TOOL_TYPE.TEXT)">
      <el-tooltip
        class="item"
        effect="dark"
        content="文本框"
        placement="top"
      >
        <div class="tool-dom">
          <i id="move" class="el-icon-document" />
          <span class="shortcut">T</span>
        </div>
      </el-tooltip>
    </div>
    <!-- 删除 -->
    <div class="tool" @click="changeDrawType(TOOL_TYPE.DELETE)">
      <el-tooltip
        class="item"
        effect="dark"
        content="删除"
        placement="top"
      >
        <div class="tool-dom">
          <i id="delete" class="el-icon-delete" />
        </div>
      </el-tooltip>
    </div>
    <!-- 颜色 -->
    <div class="tool tool-color">
      <el-color-picker value="canvasOption.penColor" @change="onColorChange" size="mini" />
    </div>
  </div>
</template>

<script>
import { TOOL_TYPE } from './ToolEnumerate.js'

export default {
  name: 'MarkTool',
  props: {
    canvasOption: { type: Object, required: true }
  },
  data () {
    return {
      TOOL_TYPE,
      penWeight: [ // 画笔宽度数据
        {
          label: 'min',
          size: 2,
          active: true
        },
        {
          label: 'mid',
          size: 6,
          active: false
        },
        {
          label: 'big',
          size: 10,
          active: false
        }
      ]
    }
  },
  computed: {
    drawType () {
      return this.canvasOption.drawType
    }
  },
  methods: {
    changeDrawType (type) {
      const data = { type, value: '' }
      this.$emit('changeTool', data)
    },
    /**
     * @description 当颜色改变时触发
     */
    onColorChange (value) {
      const data = { type: TOOL_TYPE.COLOR, value }
      this.$emit('changeTool', data)
    },
    /**
     * @description 更改线宽
     */
    changeLineWidth (penWeightItem) {
      this.penWeight.forEach(item => { item.active = false })
      penWeightItem.active = true
      this.canvasOption.lineWidth = penWeightItem.size
    },
  }
}
</script>

<style lang="less" scoped>
.mark-tool {
  display: flex;
  flex-wrap: wrap;
  padding: 20px 12px 6.5px;
  margin-left: -13.5px;
  font-size: 12px;
  color: #eee;
  border-bottom: 1px solid #666;

  .tool {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 25px;
    height: 25px;
    margin-bottom: 13.5px;
    margin-left: 13.5px;
    font-size: 14px;
    line-height: 1;
    color: #eee;
    text-align: center;
    cursor: pointer;
    background-clip: content-box;
    border-radius: 3px;
    transition: all 0.3s ease;

    .circle {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 1px solid;
      border-radius: 50%;
    }

    .shortcut {
      position: absolute;
      right: 1px;
      bottom: 2px;
      font-size: 8px;
      line-height: 1;
    }

    &:hover {
      color: #eee;
      background-color: #282828;
    }

    &.active {
      color: #eee;
      background-color: #282828;
    }
  }

  .tool-color {
    & /deep/ .el-color-picker--mini {
      height: 25px !important;
    }

    & /deep/ .el-color-picker__trigger {
      width: 25px !important;
      height: 25px !important;
      border: none;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0);
    }
  }
}
</style>
