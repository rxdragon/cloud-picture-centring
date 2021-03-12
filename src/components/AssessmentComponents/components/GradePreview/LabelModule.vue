<template>
  <div class="label-module">
    <div
      class="label-item"
      :class="{
        'is-active': gradeItem.id === activeId,
        'one-all-label': gradeItem.isOneAll,
        'small': gradeItem.value === 'small',
        'middle': gradeItem.value === 'middle',
        'pull': gradeItem.value === 'pull',
        'plant': gradeItem.value === 'plant',
      }"
      v-for="gradeItem in lableChildren"
      :key="gradeItem.id"
      @click="selectGradeItem(gradeItem.id)"
    >
      {{ gradeItem.name }}
    </div>
    <div class="degree-module" v-if="activeLabel">
      <div class="tip">
        <template v-if="!activeLabel.isOneAll">请选中“{{ activeLabel.name }}”问题程度</template>
        <template v-else>一键修改全部问题程度</template>
      </div>
      <div
        class="level-item"
        :class="{
          'is-active': activeLabel.value === levelItem.value
        }"
        v-for="levelItem in greadeLevel"
        :key="levelItem.value"
        @click="selectGradeLevel(levelItem.value)"
      >
        <div class="level-point" :class="levelItem.value"></div>
        {{ levelItem.lable }}
      </div>
    </div>
  </div>
</template>

<script>
import { GRADE_LEVEL, gradeLevelToCN } from '@/api/assessmentCenter.js'

const greadeLevel = [{
  lable: gradeLevelToCN[GRADE_LEVEL.PLANT],
  value: GRADE_LEVEL.PLANT
}, {
  lable: gradeLevelToCN[GRADE_LEVEL.SMALL],
  value: GRADE_LEVEL.SMALL
}, {
  lable: gradeLevelToCN[GRADE_LEVEL.MIDDLE],
  value: GRADE_LEVEL.MIDDLE
}, {
  lable: gradeLevelToCN[GRADE_LEVEL.PULL],
  value: GRADE_LEVEL.PULL
}]

export default {
  name: 'LabelModule',
  props: {
    labelClass: { type: Object, required: true },
    activeLabelId: { type: [String, Number] }
  },
  data () {
    return {
      greadeLevel,
    }
  },
  computed: {
    // 全部子项
    lableChildren () {
      return this.labelClass.children || []
    },
    // 当前激活id
    activeId () {
      return this.activeLabelId
    },
    // 当前激活id
    activeLabel () {
      const findActiveLable = this.lableChildren.find(item => item.id === this.activeLabelId)
      return findActiveLable
    }
  },
  methods: {
    /**
     * @description 选中问题标签
     */
    selectGradeItem (id) {
      this.$emit('selectLabelId', id)
    },
    /**
     * @description 设置底色
     */
    selectGradeLevel (value) {
      if (!this.activeLabel) return
      function setLableItemGradeLevel (lableItem, level) {
        if (lableItem.value) {
          this.deleteLable(lableItem, lableItem.value)
        }
        lableItem.value = level
        this.addLable(lableItem, level)
      }
      // 判断是否一键修改
      if (!this.activeLabel.isOneAll) {
        setLableItemGradeLevel.call(this, this.activeLabel, value)
      } else {
        this.lableChildren.forEach(lableItem => {
          if (lableItem.isOneAll) return
          setLableItemGradeLevel.call(this, lableItem, value)
        })
      }
      this.judgeIsAllGradeLevelSame()
    },
    /**
     * @description 查找问题程度
     * @param {Object} labelItem 细类问题
     * @param {Object} value 问题程度
     */
    findLevelObj (labelItem, value) {
      const findGradeLevelObj = labelItem.children.find(item => item.name === gradeLevelToCN[value])
      return findGradeLevelObj
    },
    /**
     * @description 添加标签
     */
    addLable (lableItem, level) {
      const findLevel = this.findLevelObj(lableItem, level)
      const classId = this.labelClass.id
      const lableId = findLevel.parent_id
      const levelId = findLevel.id
      const chaineId = `${classId}-${lableId}-${levelId}`
      // 添加id
      console.error(chaineId)
    },
    /**
     * @description 删除标签
     */
    deleteLable (lableItem, level) {
      // 删除标签,
      // TODO canvas 中删除标签要将表格内对应value清楚
    },
    /**
     * @description 判断评价是否一致
     */
    judgeIsAllGradeLevelSame () {
      let levels = new Set()
      this.lableChildren.forEach(lableItem => {
        if (!lableItem.isOneAll) {
          levels.add(lableItem.value)
        }
      })
      levels = [...levels]
      // 评分一致
      if (levels.length === 1) {
        const findOneLable = this.lableChildren.find(item => item.isOneAll)
        if (findOneLable) { findOneLable.value = levels[0] }
      }
    }
  }
}
</script>

<style lang="less" scoped>
@defaultColor: #909399;

.label-item {
  display: inline-block;
  width: max-content;
  padding: 4px 16px;
  margin-bottom: 10px;
  color: #fff;
  text-align: center;
  cursor: pointer;
  user-select: none;
  background-color: @defaultColor;
  border: 1px solid transparent;
  border-radius: 4px;

  &.is-active {
    border: 1px solid #fff;
  }

  &.one-all-label {
    width: 100%;
  }
}

.degree-module {
  .tip {
    margin-bottom: 6px;
    font-size: 12px;
    color: #eee;
  }

  .level-item {
    display: flex;
    align-items: center;
    width: 100%;
    height: 38px;
    padding: 9px 16px;
    margin-bottom: 6px;
    font-size: 12px;
    color: #c0c4cc;
    cursor: pointer;
    user-select: none;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    transition: all 0.3s;

    .level-point {
      width: 4px;
      height: 4px;
      margin-right: 10px;
      border-radius: 100%;
    }

    &.is-active {
      background-color: rgba(0, 0, 0, 0.4);
    }
  }
}

.small {
  background-color: #ff8f00;
}

.middle {
  background-color: #ff8f00;
}

.pull {
  background-color: #ff3974;
}

.plant {
  background-color: #38bc7f;
}
</style>
