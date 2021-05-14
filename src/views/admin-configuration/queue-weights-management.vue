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
            <div>取片临界时长: {{ TIME_SYMBOL[scope.row.time_symbol] }}</div>
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
      <!-- 分页 -->
      <div class="page-box">
        <el-pagination
          :hide-on-single-page="true"
          :current-page.sync="pager.page"
          :page-size="pager.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="pager.total"
          @current-change="getQueueWeightTypeList"
        />
      </div>
      <div class="refresh-queue-wrap">
        <el-button type="primary" :disabled="!canRefreshQueue" @click="handleRefreshQueue">刷新队列</el-button>
      </div>
    </div>
    <el-dialog
      width="60%"
      :title="isEditMode ? '编辑类别' : '新增类别'"
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
            <el-form-item label="自身权重值" prop="weight">
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
            <el-form-item label="每小时增长权重值" prop="increase_weight">
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
            <el-form-item label="普通加急" prop="urgent_weight">
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
            <el-form-item label="V1会员加急" prop="customer_urgent_weight.customer_urgent_v1">
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
            <el-form-item label="V2会员加急" prop="customer_urgent_weight.customer_urgent_v2">
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
            <el-form-item label="V3会员加急" prop="customer_urgent_weight.customer_urgent_v3">
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
            <el-form-item label="V4会员加急" prop="customer_urgent_weight.customer_urgent_v4">
              <el-input-number
                :min="0"
                :max="9999999"
                v-number-only
                v-model="form.customer_urgent_weight.customer_urgent_v4"
                class="w100p"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="临界增加权重值" prop="critical_increase_weight">
              <el-input-number
                :min="0"
                :max="9999999"
                v-number-only
                v-model="form.critical_increase_weight"
                class="w100p"
              ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row >
          <el-col :span="11">
            <el-form-item label="约定取片时长：" prop="take_photo_time">
              <div class="duration-wrap">
                <el-input-number
                  :min="0"
                  :max="9999999"
                  v-number-only
                  v-model.number="form.take_photo_time"
                  class="duration"
                ></el-input-number>
                <el-radio-group class="duration-radio-wrap" v-model="form.time_symbol">
                  <el-radio class="duration-radio" label="min">分钟 / 单</el-radio>
                  <el-radio label="order">分钟 / 张</el-radio>
                </el-radio-group>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="取片临界时长：" prop="take_photo_time">
              <el-input-number
                :min="0"
                :max="9999999"
                v-number-only
                v-model.number="form.take_photo_time"
                class="take-photo-time"
              ></el-input-number>
              <span>{{ TIME_SYMBOL[form.time_symbol] || '-' }}</span>
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
const TIME_SYMBOL = {
  order: '分钟 / 单',
  min: '分钟 / 张'
}
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
  time_symbol: 'min',
  take_photo_time: 30,
  critical_increase_weight: 0,
}
export default {
  name: 'QueueWeightsManagement',
  data () {
    return {
      TIME_SYMBOL,
      routeName: this.$route.name, // 路由名字
      showDialog: false,
      loading: false,
      form: _.cloneDeep(baseData),
      rules: {
        name: [
          { required: true, message: '请输入类别名称', trigger: 'blur' },
          { min: 1, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        weight: [{ required: true, message: '请输入自身权重值', trigger: 'blur' }],
        increase_weight: [{ required: true, message: '每小时增长权重值', trigger: 'blur' }],
        urgent_weight: [{ required: true, message: '请输入普通加急权重值', trigger: 'blur' }],
        customer_urgent_weight: {
          customer_urgent_v1: [{ required: true, message: '请输入V1会员加急权重值', trigger: 'blur' }],
          customer_urgent_v2: [{ required: true, message: '请输入V2会员加急权重值', trigger: 'blur' }],
          customer_urgent_v3: [{ required: true, message: '请输入V3会员加急权重值', trigger: 'blur' }],
          customer_urgent_v4: [{ required: true, message: '请输入V4会员加急权重值', trigger: 'blur' }],
        },
        take_photo_time: [
          { required: true, message: '请输入约定取片时长', trigger: 'blur' },
          { type: 'number', min: 30, max: 9999999, message: '约定取片时长 30 到 9999999 之间', trigger: 'blur' }
        ],
        critical_increase_weight: [{ required: true, message: '请输入临界增加权重值', trigger: 'blur' }]
      },
      tableData: [],
      canRefreshQueue: false,
      pager: {
        page: 1,
        pageSize: 10,
        total: 0
      },
    }
  },
  computed: {
    isEditMode () {
      return Boolean(this.form.id)
    }
  },
  mounted () {
    this.getQueueWeightTypeList()
    this.getCanRefreshQueueTime()
  },
  methods: {
    /**
     * @description 校验表单
     */
    submitForm () {
      this.$refs['form'].validate((valid) => {
        if (this.tableData.some(row => row.name === this.form.name && Number(row.id) !== Number(this.form.id))) {
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
        this.pager.page = 1
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
      const req = {
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const res = await queueWeightManageApi.getQueueWeightTypeList(req)
        this.tableData = res.items
        this.pager.total = res.total
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
      this.$refs['form'] && this.$refs['form'].resetFields()
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

  .duration-wrap {
    display: flex;
    flex-wrap: wrap;

    .duration {
      flex-shrink: 1;
      max-width: 150px;
      margin-right: 20px;
    }

    .duration-radio-wrap {
      display: flex;
      align-items: center;
      margin-top: 10px;

      .duration-radio {
        flex-shrink: 1;
        margin-right: 10px;
      }
    }
  }

  .take-photo-time {
    width: 65%;
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
