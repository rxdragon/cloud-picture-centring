<template>
  <div class="sand-clock-config page-class">
    <transition name="fade" mode="out-in">
      <div v-if="!editConfig" class="sand-clock-list">
        <!-- 沙漏头部 -->
        <div class="header">
          <div class="header-lef">
            <h3>沙漏计时配置</h3>
          </div>
          <div class="header-right">
            <div class="switch-box">
              <span>沙漏当前状态：{{ sandClockValue ? '开启' : '关闭' }}</span>
              <el-switch
                v-model="sandClockValue"
                active-color="#4669fb"
                inactive-color="#D4D4D9"
                @change="sandChange"
              />
            </div>
            <el-button type="primary" size="mini" @click="addSandClock">配置沙漏</el-button>
          </div>
        </div>
        <div class="order-list">
          <el-tabs v-model="listActive">
            <el-tab-pane label="产品沙漏配置" name="productSandConfig">
              <div class="table-box no-border">
                <product-sand-config
                  :is-refresh.sync="editConfig"
                  :edit-id.sync="editId"
                  :hour-glass-length="hourGlassLength"
                  @changeHourGlassGlobalState="getHourGlassGlobalState"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane label="基础沙漏配置" name="baseSandConfig">
              <div class="table-box">
                <base-sand-config
                  :is-refresh.sync="editConfig"
                  :hour-glass-length="hourGlassLength"
                  @changeHourGlassGlobalState="getHourGlassGlobalState"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <edit-sand-clock-config
        v-else
        :edit-id="editId"
        :base-edit="baseEdit"
        :edit-config.sync="editConfig"
      />
    </transition>
  </div>
</template>

<script>
import EditSandClockConfig from './components/EditSandClockConfig'
import ProductSandConfig from './components/ProductSandConfig'
import BaseSandConfig from './components/BaseSandConfig'

import { HourGlassSettingEnum } from '@/utils/enumerate.js'
import * as OperationManage from '@/api/operationManage.js'

export default {
  name: 'SandClockConfig',
  components: { EditSandClockConfig, ProductSandConfig, BaseSandConfig },
  data () {
    return {
      sandClockValue: false,
      editConfig: false, // 是否显示编辑窗口
      editId: '',
      hourGlassLength: 0,
      listActive: 'productSandConfig' // productSandConfig 产品沙漏配置 baseSandConfig 基础沙漏配置
    }
  },
  computed: {
    baseEdit () {
      return this.listActive === 'baseSandConfig'
    }
  },
  watch: {
    editConfig (value) {
      if (!value) {
        this.editId = ''
      }
    },
    // 编辑id
    editId (value) {
      if (value) {
        this.editConfig = true
      }
    }
  },
  created () {
    this.hourGlassLength = Object.keys(HourGlassSettingEnum).length
  },
  methods: {
    /**
     * @description 添加沙漏
     */
    addSandClock () {
      this.editConfig = true
    },
    /**
     * @description 获取全局沙漏状态
     */
    getHourGlassGlobalState (value) {
      this.sandClockValue = value
    },
    /**
     * @description 监听沙漏变化
     */
    sandChange (openSand) {
      if (openSand) {
        OperationManage.enableHourGlassGlobalState()
          .then(msg => {
            if (msg) {
              this.$newMessage.success('开启成功')
            } else {
              this.sandClockValue = false
            }
          })
          .catch(() => {
            this.sandClockValue = false
          })
      } else {
        OperationManage.disableHourGlassGlobalState()
          .then(msg => {
            if (msg) {
              this.$newMessage.success('关闭成功')
            } else {
              this.sandClockValue = true
            }
          })
          .catch(() => {
            this.sandClockValue = true
          })
      }
    }
  }
}
</script>

<style lang="less">


.sand-clock-config {
  .header {
    .header-right {
      display: flex;
      align-items: center;

      .switch-box {
        & > span {
          margin-right: 20px;
        }
      }
    }

    .el-button {
      margin-left: 20px;
    }
  }

  .order-list {
    .table-box {
      margin-top: 0;

      .tag-label {
        .el-tag {
          display: block;
          width: min-content;
        }
      }
    }
  }
}
</style>
