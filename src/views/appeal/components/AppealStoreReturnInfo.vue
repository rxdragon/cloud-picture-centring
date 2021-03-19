<template>
  <div class="appeal-store-return-info">
    <div class="panel-title">门店退回</div>
    <div class="panel-main">
      <div class="panel-content content-one">
        局部退回标记：
        <div
          v-for="(reasonItem, index) in storePartReworkReason"
          :key="index"
        >
          <div
            v-for="(reasonManageItem) in reasonItem.reasonManage"
            :key="reasonManageItem.id"
            :class="['reason-item', reasonManageItem.cancel && reasonManageItem.isDel ? 'del' : '']"
          >
            <span>{{ reasonManageItem.name }}</span>
            <span v-if="reasonManageItem.cancel && reasonManageItem.isDel">(已删除)</span>
            <span
              v-if="reasonManageItem.cancel && !reasonManageItem.isDel"
              class="red"
            >
              (标记删除)
            </span>
          </div>
        </div>
      </div>
      <div class="panel-content content-one">
        局部退回备注：
        <span
          v-for="(storePartReworkReasonItem, index) in storePartReworkReason"
          :key="index"
        >
          {{ storePartReworkReasonItem.note }}
        </span>
      </div>
      <div class="panel-content content-one">
        整体退回标记：
        <div
          v-for="(reasonItem) in storeReworkReasonManage"
          :key="reasonItem.id"
          :class="['reason-item', reasonItem.cancel && reasonItem.isDel ? 'del' : '']"
        >
          <span>{{ reasonItem.name }}</span>
          <span v-if="reasonItem.cancel && reasonItem.isDel">(已删除)</span>
          <span class="red" v-if="reasonItem.cancel && !reasonItem.isDel">(标记删除)</span>
        </div>
      </div>
      <div class="panel-content">整体退回备注：{{ storeReworkNote }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppealStoreReturnInfo',
  props: {
    photoData: { type: Object, required: true }
  },
  computed: {
    // 局部问题
    storePartReworkReason () {
      return this.photoData.storePartReworkReason || {}
    },
    // 整体原因
    storeReworkReasonManage () {
      return this.photoData.storeReworkReasonManage || {}
    },
    // 整体备注
    storeReworkNote () {
      return this.photoData.storeReworkNote || ''
    }
  }
}
</script>

<style lang="less" scoped>
.appeal-store-return-info {
  margin-top: 20px;
  font-size: 14px;
  color: #303133;

  .issue-class-box {
    display: flex;

    .label-title {
      flex-shrink: 0;
      margin: 0 20px 0 0;
      font-size: 14px;
      font-weight: 600;
      line-height: 28px;
      color: #303133;
    }

    .label-tag {
      margin-right: 10px;

      &.plant {
        color: #38bc7f;
        background-color: #ecf7f2;
        border-color: #7fd9af;
      }

      &.pull {
        color: #ff3974;
        background-color: #fff0f0;
        border-color: #f99ab7;
      }

      &.middle,
      &.small {
        color: #ff8f00;
        background-color: #fff7ed;
        border-color: #ffce90;
      }
    }

    .type-tag {
      margin-right: 10px;

      &.plant {
        color: #fff;
        background-color: #44c27e;
        border-color: #44c27e;
      }

      &.pull {
        color: #fff;
        background-color: #ff3974;
        border-color: #ff3974;
      }

      &.none {
        color: #fff;
        background-color: #4669fb;
        border-color: #4669fb;
      }
    }

    .label-box {
      margin-bottom: -10px;

      .el-tag {
        margin: 0 10px 10px 0;
        font-size: 12px;
        font-weight: 400;
        border-radius: 4px;
      }
    }
  }

  .panel-row {
    padding: 16px 0 0;
    font-size: 14px;
    line-height: 22px;
    color: #303133;

    .order-info {
      .order-info-title {
        display: inline-block;
      }
    }
  }

  .panel-main {
    padding: 0 20px 20px;
    margin-top: 12px;
    background-color: #fafafa;
    border-radius: 4px;

    .panel-content {
      padding: 10px 0;

      .evaluate-item {
        margin-right: 16px;
        margin-bottom: 10px;
      }

      .reason-item {
        display: inline-block;
        padding: 4px;
        margin-right: 16px;
        font-size: 12px;
        color: #4669fb;
        background: rgba(237, 240, 255, 1);
        border: 1px solid rgba(181, 195, 253, 1);
        border-radius: 4px;

        .red {
          color: red;
        }

        &.del {
          color: #919199;
          background: rgba(212, 212, 217, 1);
          border: none;
        }
      }
    }

    .content-one {
      display: flex;
      flex-wrap: wrap;
      border-bottom: 1px solid @borderColor;
    }
  }
}
</style>
