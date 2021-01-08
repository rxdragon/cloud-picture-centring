<template>
  <div class="operation-box">
    <div class="all-open">
      <div class="switch-module">
        <div class="label-text">修图选项</div>
        <div class="desc">全部</div>
        <div class="switch-content">
          <el-switch v-model="allOpen" active-color="#4669FB" inactive-color="#C0C4CC"></el-switch>
        </div>
      </div>
    </div>
    <div
      class="operation-item"
      v-for="(operation, operationIndex) in operationList"
      :key="operationIndex"
    >
      <div class="switch-module">
        <div class="label-text">{{ operation.name }}</div>
        <div class="switch-content">
          <el-switch
            v-model="handleSwtich[operationIndex]"
            :disabled="operation.hidden"
            active-color="#4669FB"
            inactive-color="#C0C4CC"
          >
          </el-switch>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { OPERATION_TYPE, OperationName } from '@/api/autoRetouch'

export default {
  name: 'OperationBox',
  props: {
    handleSwtich: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      operationList: {
        [OPERATION_TYPE.CROP]: {
          name: OperationName[OPERATION_TYPE.CROP],
          hidden: true,
        },
        [OPERATION_TYPE.WARP]: {
          name: OperationName[OPERATION_TYPE.WARP],
          hidden: false,
        },
        [OPERATION_TYPE.RETOUCH]: {
          name: OperationName[OPERATION_TYPE.RETOUCH],
          hidden: false,
        },
        [OPERATION_TYPE.MATTING]: {
          name: OperationName[OPERATION_TYPE.MATTING],
          hidden: false,
        }
      }
    }
  },
  computed: {
    allOpen: {
      get () {
        const operationValues = Object.values(this.handleSwtich)
        return operationValues.every(item => item)
      },
      set (value) {
        for (const key in this.handleSwtich) {
          if (!this.operationList[key].hidden) {
            this.handleSwtich[key] = value
          }
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.operation-box {
  width: 100%;
  height: 100%;
  padding: 10px;

  .switch-module {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 9px;
    margin-bottom: 10px;
    font-size: 14px;
    color: #eee;
    background-color: #393939;
    border-radius: 4px;

    .desc {
      margin-right: 6px;
      margin-left: auto;
    }
  }

  .all-open {
    .switch-module {
      background-color: transparent;

      .label-text {
        position: relative;
        display: flex;
        align-items: center;

        &::before {
          position: absolute;
          top: 50%;
          left: -6px;
          display: inline-block;
          width: 1px;
          height: 16px;
          content: '';
          background-color: @red;
          transform: translateY(-50%);
        }
      }
    }
  }

  .operation-item {
    display: flex;
  }
}
</style>
