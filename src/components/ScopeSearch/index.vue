<template>
  <div class="scope-search" @mouseenter="handleMouseEnter" @mouseleave="showClose = false">
    <input
      type="text"
      class="range-input"
      v-numberOnly
      :min="0"
      :max="100"
      :placeholder="startPlaceholder"
      v-model="startInput"
      @change="handleChange"
    />
    <span class="range-separator">~</span>
    <input
      type="text"
      class="range-input"
      v-numberOnly
      :min="0"
      :max="100"
      :placeholder="endPlaceholder"
      v-model="endInput"
      @change="handleChange"
    />
    <i
      @click="handleClickIcon"
      :class="[showClose ? '' + 'el-icon-circle-close' : '']"
      class="input__icon range__close-icon"
    />
  </div>
</template>

<script>
export default {
  name: 'ScopeSearch',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    startPlaceholder: { type: String, default: '请输入' },
    endPlaceholder: { type: String, default: '请输入' },
    value: {}
  },
  data () {
    return {
      showClose: false,
      startInput: '',
      endInput: ''
    }
  },
  computed: {
    valueIsEmpty () {
      const val = this.value
      if (Array.isArray(val)) {
        for (let i = 0, len = val.length; i < len; i++) {
          if (val[i]) {
            return false
          }
        }
      } else {
        if (val) {
          return false
        }
      }
      return true
    },
  },
  methods: {
    handleClickIcon () {
      if (this.showClose) {
        this.valueOnOpen = this.value
        this.startInput = ''
        this.endInput = ''
        this.$emit('change', null)
      }
    },
    handleMouseEnter () {
      if (!this.valueIsEmpty) {
        this.showClose = true
      }
    },
    handleChange () {
      const data = [this.startInput || '', this.endInput || '']
      this.$emit('change', data)
    }
  }
}
</script>

<style lang="less" scoped>
.scope-search {
  -webkit-appearance: none;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  padding: 3px 10px;
  font-size: inherit;
  line-height: 40px;
  color: #606266;
  background-color: #fff;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: 0;
  -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  .range-input {
    display: inline-block;
    width: 40%;
    height: 100%;
    padding: 0;
    -webkit-appearance: none;
    margin: 0;
    font-size: 14px;
    line-height: 1;
    -moz-appearance: none;
    color: #606266;
    appearance: none;
    text-align: center;
    border: none;
    outline: 0;

    &::placeholder {
      color: #c7cad1;
    }
  }

  .range-separator {
    flex-shrink: 0;
    width: 5%;
    line-height: 32px;
    color: #303133;
  }

  .el-icon-circle-close {
    cursor: pointer;
  }

  .range__close-icon {
    display: inline-block;
    float: right;
    width: 25px;
    font-size: 14px;
    line-height: 32px;
    color: #c0c4cc;
  }
}
</style>
