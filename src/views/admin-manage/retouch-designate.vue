<template>
  <div class="retouch-designate">
    <div class="header">
      <h3>修图指派</h3>
    </div>
    <!-- 列表 -->
    <div class="module-panel">
      <div class="search-box">
        <div class="order-search search-item">
          <el-input
            v-model.trim="orderSearchValue"
            placeholder="请输入内容"
            class="input-with-select"
            @keyup.native.enter="searchOrder(1)"
          >
            <el-select slot="prepend" v-model="orderType" placeholder="请选择">
              <el-option label="订单号" :value="1" />
              <el-option label="顾客姓名" :value="2" />
              <el-option label="手机号" :value="3" />
            </el-select>
          </el-input>
        </div>
        <div class="search-item">
          <el-button type="primary">查 询</el-button>
        </div>
      </div>
      <div class="module-table-box">
        <el-table :data="tableData" style="width: 100%;">
          <el-table-column prop="date" label="订单号">
            <template slot-scope="{ row }">
              <div class="standard-box">
                {{ row.orderNum }}
                <div class="standard-icon">
                  <div :class="`iconmap-standard-${row.retouchType}`" />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="顾客姓名" />
          <el-table-column prop="date" label="手机号" />
          <el-table-column prop="date" label="拍摄门店" />
          <el-table-column prop="date" label="拍摄产品" />
          <el-table-column prop="date" label="操作">
            <template slot-scope="{ row }">
              <el-button type="primary" size="mini" @click="designate(row.orderId)">修图指派</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 选中修图师 -->
    <div class="module-panel designate-retoucher" v-if="hasDesignateList">
      <div class="designate-group" v-for="(groupItem, groupkey) in designateList" :key="groupkey">
        <div class="designate-group-label">{{ groupItem.name }}</div>
        <div class="designate-group-value">
          <el-tag v-for="staff in groupItem.children" :key="staff.id" size="mini">
            {{ staff.name }}
          </el-tag>
        </div>
      </div>
      <div class="button-box">
        <el-button type="primary" size="small" @click="affirmDesignate">确认指派</el-button>
      </div>
    </div>
    <el-dialog
      title="修图指派"
      :visible.sync="designateDialog"
      width="30%"
      class="designate-dialog"
      center
    >
      <el-form label-width="80px">
        <el-form-item label="云端伙伴">
          <staff-select ref="staffSelect" v-model="staffIds" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="designateDialog = false">取 消</el-button>
        <el-button type="primary" @click="sureSelectStaff">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import StaffSelect from '@SelectBox/StaffSelect'

export default {
  name: 'RetouchDesignate',
  components: { StaffSelect },
  data () {
    return {
      orderSearchValue: '',
      orderType: 1, // 查询类型 1 订单号 2 顾客姓名 3 手机号
      tableData: [
        {
          date: 1
        }
      ],
      designateDialog: false,
      staffIds: [], // 指派修图师id
      designateList: {}, // 指派修图师列表
    }
  },
  computed: {
    // 是否指派修图师列表
    hasDesignateList () {
      return Object.keys(this.designateList).length
    }
  },
  methods: {
    searchOrder () {
      console.error(1)
    },
    designate () {
      // TODO 修图指派
      this.designateDialog = true
    },
    /**
     * @description 确认修图师
     */
    sureSelectStaff () {
      const checkStaffNode = this.$refs['staffSelect'].getCheckedStaff()
      const groupList = {}
      checkStaffNode.forEach(staffItem => {
        const groupInfo = staffItem.parent
        const groupId = staffItem.parent.value
        if (groupList[groupId]) {
          groupList[groupId]['children'].push({
            name: staffItem.label,
            id: staffItem.value
          })
        } else {
          groupList[groupId] = {
            name: groupInfo.label,
            children: [
              {
                name: staffItem.label,
                id: staffItem.value
              }
            ]
          }
        }
      })
      this.designateList = groupList
    },
    /**
     * @description 确认指派修图师
     */
    async affirmDesignate () {
      try {
        let message = '<p>确认将订单号sasdasda指派给</p>'
        for (const key in this.designateList) {
          const groupInfo = this.designateList[key]
          let staffString = groupInfo.children.map(item => `【${ item.name }】`)
          staffString = staffString.join('、')
          const createString = `<p>${groupInfo.name}:${staffString}</p>`
          message += createString
        }
        await this.$confirm(message, '确认指派', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          type: 'warning'
        })
        // TODO 指派接口
      } catch (error) {
        console.error(error)
      } finally {
        // TODO
      }
    }
  }
}
</script>

<style lang="less" scoped>
.retouch-designate {
  .search-box {
    margin-bottom: 20px;

    .order-search {
      & /deep/ .el-input-group__prepend {
        width: 120px;
      }
    }
  }

  .designate-dialog {
    & /deep/ .el-dialog__body {
      padding-bottom: 0;
    }

    & /deep/ .staff-select {
      .el-cascader {
        width: 100%;
      }
    }
  }

  .designate-retoucher {
    margin-top: 20px;

    .designate-group {
      display: flex;
      margin-bottom: 20px;

      &:nth-last-of-type(2) {
        margin-bottom: 0;
      }

      .designate-group-label {
        width: 200px;
        font-size: 14px;
      }

      .designate-group-value {
        .el-tag {
          margin-right: 12px;
        }
      }
    }

    .button-box {
      text-align: right;
    }
  }
}
</style>
