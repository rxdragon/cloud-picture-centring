<template>
  <div class="queue-weights-management-main">
    <div class="header">
      <h3> 队列权重管理 </h3>
      <el-button type="primary" @click="showDialog = true">新增类别</el-button>
    </div>
    <div class="module-panel">
      <el-table :data="tableData" style="width: 100%;" >
        <el-table-column prop="name" label="类别名称"></el-table-column>
        <el-table-column prop="weight" label="自身权重" width="100"></el-table-column>
        <el-table-column prop="increase_weight" label="每小时增长权重" width="150"></el-table-column>
        <el-table-column prop="urgent_weight" label="加急权重">
          <template slot-scope="{ row }">
            <div v-for="item in row.customerUrgentWeight" :key="item.title">
              {{ item.title }} : {{ item.value }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="take_photo_time" label="取片时长">
          <template slot-scope="scope">
            <div>约定时长: {{ scope.row.take_photo_time }} 分钟 / 张</div>
            <div>临界增加权重: {{ scope.row.critical_increase_weight }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="product_count" label="归属产品数量"></el-table-column>
        <el-table-column prop="operatorName" label="创建人" width="80"></el-table-column>
        <el-table-column prop="updated_at" label="创建时间"></el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEditRow(scope)">
              修改
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="refresh-queue-wrap">
        <el-button type="primary" :disabled="!canRefreshQueue" @click="handleRefreshQueue">刷新队列</el-button>
      </div>
    </div>
    <el-dialog
      width="60%"
      title="新增类别"
      center
      @close="handleCloseDialog"
      custom-class="empty-dialog"
      :visible.sync="showDialog"
    >
      <el-form
        ref="form"
        v-loading="loading"
        :model="form"
        :rules="rules"
        label-width="150px"
      >
        <el-row >
          <el-col :span="22">
            <el-form-item label="类别名称" prop="name">
              <el-input maxLength="8" v-model="form.name"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row >
          <el-col :span="11">
            <el-form-item label="自身权重值">
              <el-input-number
                :min="0"
                :max="9999999"
                v-number-only
                v-model="form.weight"
                class="w100p"
              >
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="每小时增长权重值">
              <el-input-number
                :min="0"
                :max="9999999"
                v-number-only
                v-model="form.increase_weight"
                class="w100p"
              ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row >
          <el-col :span="11">
            <el-form-item label="普通加急">
              <el-input-number
                :min="0"
                :max="9999999"
                v-number-only
                v-model="form.urgent_weight"
                class="w100p"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="V1会员加急">
              <el-input-number
                :min="0"
                :max="9999999"
                v-number-only
                v-model="form.customer_urgent_weight.customer_urgent_v1"
                class="w100p"
              ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row >
          <el-col :span="11">
            <el-form-item label="V2会员加急">
              <el-input-number
                :min="0"
                :max="9999999"
                v-number-only
                v-model="form.customer_urgent_weight.customer_urgent_v2"
                class="w100p"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="V3会员加急">
              <el-input-number
                :min="0"
                :max="9999999"
                v-number-only
                v-model="form.customer_urgent_weight.customer_urgent_v3"
                class="w100p"
              ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row >
          <el-col :span="11">
            <el-form-item label="V4会员加急">
              <el-input-number
                :min="0"
                :max="9999999"
                v-number-only
                v-model="form.customer_urgent_weight.customer_urgent_v1"
                class="w100p"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="约定取片时长：">
              <el-input-number
                :min="30"
                :max="9999999"
                v-number-only
                v-model="form.take_photo_time"
                class="duration"
              ></el-input-number>
              <span>分钟 / 张</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row >
          <el-col :span="11">
            <el-form-item
              :min="0"
              :max="9999999"
              v-number-only
              label="临界增加权重值"
            >
              <el-input-number v-model="form.critical_increase_weight" class="w100p"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="handleCloseDialog">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as queueWeightManageApi from '@/api/queueWeightManageApi'
const baseData = {
  name: '',
  weight: 0,
  increase_weight: 0,
  urgent_weight: 0,
  customer_urgent_weight: {
    customer_urgent_v1: 0,
    customer_urgent_v2: 0,
    customer_urgent_v3: 0,
    customer_urgent_v4: 0
  },
  take_photo_time: 30,
  critical_increase_weight: 0,
}
export default {
  name: 'QueueWeightsManagement',
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      showDialog: false,
      loading: false,
      form: _.cloneDeep(baseData),
      rules: {
        name: [
          { required: true, message: '请输入类别名称', trigger: 'blur' },
          { min: 1, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ]
      },
      tableData: [],
      canRefreshQueue: false
    }
  },
  mounted () {
    this.getQueueWeightTypeList()
    this.getCanRefreshQueueTime()
  },
  methods: {
    submitForm () {
      this.$refs['form'].validate((valid) => {
        if (this.tableData.some(row => row.name === this.form.name)) {
          return this.$message.error('请勿填写重复类别名称。')
        }
        if (valid) {
          this.submitQueueWeight()
        }
      })
    },
    /**
     * @description 提交队列权重
     */
    async submitQueueWeight () {
      this.loading = true
      // 列表里是否有这个id。
      const index = this.tableData.findIndex(row => Number(row.id) === Number(this.form.id))
      const isCreate = index < 0
      const action = isCreate
        ? queueWeightManageApi.addQueueWeightType
        : queueWeightManageApi.editQueueWeightType

      try {
        await action(this.form)
        await this.getQueueWeightTypeList()
        const message = isCreate ? '新增类别权重成功' : '编辑类别权重成功'
        this.$message.success(message)
        this.showDialog = false
        this.form =_.cloneDeep(baseData)
      } finally {
        this.loading = false
      }
    },
    /**
     * @description 获取列表信息
     */
    async getQueueWeightTypeList () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const res = await queueWeightManageApi.getQueueWeightTypeList()
        this.tableData = res
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     @description 打开编辑弹窗
     */
    handleEditRow ({ row }) {
      this.form = {
        id: row.id,
        name: row.name,
        weight: row.weight,
        increase_weight: row.increase_weight,
        urgent_weight: row.urgent_weight,
        customer_urgent_weight: _.cloneDeep(row.customer_urgent_weight),
        take_photo_time: row.take_photo_time,
        critical_increase_weight: row.critical_increase_weight,
      }
      this.showDialog = true
    },
    /**
     @description 关闭编辑弹窗
     */
    handleCloseDialog () {
      this.form =_.cloneDeep(baseData)
      this.showDialog = false
    },
    /**
     @description 刷新队列
     */
    async handleRefreshQueue () {
      this.$store.dispatch('setting/showLoading', this.routeName)
      try {
        await queueWeightManageApi.refreshQueue()
        await this.getCanRefreshQueueTime()
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 判断是否可以刷新队列
     */
    async getCanRefreshQueueTime () {
      const res = await queueWeightManageApi.canRefreshQueue()
      if (Number(res) <= 0) {
        this.canRefreshQueue = true
      } else {
        this.canRefreshQueue = false
        setTimeout(() => {
          this.canRefreshQueue = true
        }, Number(res) * 1000)
      }
    }
  }
}

</script>

<style scoped lang="less">

.queue-weights-management-main {
  position: relative;
  height: 100%;

  .w100p {
    width: 100%;
  }

  .duration {
    width: 70%;
    margin-right: 20px;
  }

  .refresh-queue-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 20px;
  }
}
</style>
