<template>
  <div class="amend-order page-class">
    <div class="header">
      <h3>修改照片产品</h3>
    </div>
    <!-- 搜索模块 -->
    <el-row class="search-box" :gutter="20">
      <!-- 流水号 -->
      <el-col :span="6" :xl="4">
        <div class="caid-search search-item">
          <span>流水号</span>
          <el-input
            v-model.trim="caid"
            :disabled="Boolean(id)"
            placeholder="请输入流水号"
            clearable
            @keyup.native.enter="getStreamInfo"
          />
        </div>
      </el-col>
      <!-- 订单号 -->
      <el-col :span="6" :xl="4">
        <div class="caid-search search-item">
          <span>订单号</span>
          <el-input
            v-model.trim="id"
            :disabled="Boolean(caid)"
            placeholder="请输入订单号"
            clearable
            @keyup.native.enter="getStreamInfo"
          />
        </div>
      </el-col>
      <!-- 查 询 -->
      <el-col :span="6" :xl="4">
        <div class="button-box search-item">
          <el-button type="primary" @click="getStreamInfo">查 询</el-button>
        </div>
      </el-col>
    </el-row>
 
    <!-- 提示 -->
    <div class="tip-box">
      <el-alert title="修改产品，只能更改相同修图标准的产品。" type="warning" effect="dark"></el-alert>
    </div>
    <!-- 订单照片显示模块 -->
    <div v-for="(item, index) in dataList" :key="index" class="caid-box module-panel">
      <div class="order-info">
        <div class="id search-item">
          <span>流水号{{ index + 1 }}</span> {{ item.stream_num }}
        </div>
        <div class="product search-item">
          <span>拍摄产品</span>
          <el-select
            v-model="item.product.id"
            clearable
            filterable
            placeholder="请选择产品"
          >
            <el-option
              v-for="(optionItem, pIndex) in productsList"
              :key="pIndex"
              :label="optionItem.name"
              :value="optionItem.id"
            />
          </el-select>
        </div>
        <div class="batch-fix-people">
          <el-button @click="showFixPeopleDialog(item)" type="primary">批量更改人数</el-button>
        </div>
      </div>
      <div class="photo-list">
        <transition name="fade-transform" mode="out-in">
          <div v-if="!isAlldelete(item.photos)" key="photoList" class="photo-list-box">
            <div v-for="(photoItem, photoIndex) in item.photos" :key="photoIndex" :style="photoItem.isDelete && 'display: none;'">
              <div v-if="!photoItem.isDelete" class="photo-box">
                <photo-box :src="photoItem.path" />
                <div class="change-num">
                  <span>人数：</span>
                  <el-input
                    :disabled="photoItem.type === PHOTO_TYPE.TEMPLATE_TYPE"
                    :class="{ 'disabled-input': photoItem.type === PHOTO_TYPE.TEMPLATE_TYPE }"
                    v-model="photoItem.people_num"
                    v-numberOnly
                    min="0"
                    size="mini"
                    placeholder="请输入人数"
                  />
                </div>
                <!-- 拼接信息 -->
                <div v-if="photoItem.isJoint" class="joint-box">
                  <div class="joint-type">
                    <span>拼接：</span>
                    <el-select v-model="photoItem.jointClass" size="mini" placeholder="请选择">
                      <el-option
                        v-for="(typeItem, typeIndex) in jointClassOption"
                        :key="typeIndex"
                        :label="typeItem.label"
                        :value="typeItem.value"
                      />
                    </el-select>
                  </div>
                  <div class="joint-sequence">
                    <span>顺序：</span>
                    <el-input v-model="photoItem.jointClassNum" size="mini" placeholder="" />
                  </div>
                </div>
                <span class="delete-button" @click="deletePhoto(item, photoItem)">
                  <i class="el-icon-error" />
                </span>
              </div>
            </div>
            <div class="empty-box" />
          </div>
          <div v-else key="noData" class="delete-all">
            <i class="el-icon-document-delete" />
            已删除全部
          </div>
        </transition>
      </div>
      <div v-if="!item.isOperatorDeletedStream" class="submit-box">
        <el-button type="primary" @click="modifyStream(item)">提交修改</el-button>
      </div>
    </div>
    <!-- 批量修改人数dialog -->
    <el-dialog
      title="批量修改人数"
      center
      width="40%"
      :close-on-click-modal="false"
      :visible.sync="batchFixVisible"
      :before-close="handleClose"
    >
      <div class="dialog-photo-list" v-if="selectStreamPhotos.length">
        <el-checkbox-group v-model="checkedPhotos" @change="handleCheckedCitiesChange">
          <el-checkbox
            v-for="(photoItem, photoIndex) in selectStreamPhotos"
            class="checkbox-photo"
            :key="photoIndex"
            :label="photoItem.id"
          >
            <div v-if="!photoItem.isDelete" class="dialog-photo-box">
              <photo-box :src="photoItem.path" :people-num="photoItem.people_num" :show-special-effects="false" />
            </div>
          </el-checkbox>
        </el-checkbox-group>

        <div class="operation-module">
          <el-checkbox
            class="check-all"
            :indeterminate="isIndeterminate"
            v-model="checkAllPhoto"
            @change="handleCheckAllChange"
          >
            全选照片
          </el-checkbox>
          <div class="batch-change-people-box">
            <span class="batch-label">需更改人数：</span>
            <el-input-number
              class="change-input"
              v-model="batchChangePeople"
              v-numberOnly
              :min="0"
              :max="20"
              size="mini"
              placeholder="请输入人数"
            />
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="sureChangePeople">确 定</el-button>
      </span>
    </el-dialog>
    <no-data v-if="!dataList.length" class="module-panel" />
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'
import NoData from '@/components/NoData'
import * as WorkManage from '@/api/workManage'
import * as Product from '@/api/product'
import { jointClass } from '@/assets/config/jointClass.js'
import { PHOTO_TYPE } from '@/utils/enumerate.js'

export default {
  name: 'AmendOrder',
  components: { PhotoBox, NoData },
  data () {
    return {
      PHOTO_TYPE,
      routeName: this.$route.name, // 路由名字
      caid: '', // 流水号
      id: '', // 订单号
      productsList: [], // 产品信息
      jointSequence: '',
      dataList: [], // 流水列表
      jointClassOption: [], // 修图类别
      batchFixVisible: false, // 是否显示批量修改人数弹框
      selectStreamPhotos: [], // 选中批量更改订单数
      checkedPhotos: [], // 选中照片id
      checkAllPhoto: false, // 是否显示全部流水
      isIndeterminate: false, // 控制样式
      batchChangePeople: 0, // 批量修改人数
    }
  },
  created () {
    this.jointClassOption = jointClass
  },
  methods: {
    /**
     * @description 是否全部删除照片
     */
    isAlldelete (photos) {
      return photos.every(photoItem => photoItem.isDelete)
    },
    /**
     * @description 获取照片订单信息
     */
    async getStreamInfo () {
      try {
        const req = {}
        if (this.id) { req.externalNum = this.id }
        if (this.caid) { req.streamNum = this.caid }
        if (!Object.keys(req).length) return this.$newMessage.warning('请输入订单号或流水号')
        this.$store.dispatch('setting/showLoading', this.routeName)
        this.productsList = []
        this.dataList = await WorkManage.getStreamInfo(req)
        if (this.dataList.length) {
          const retouchStandard = this.dataList[0].product.retouch_standard
          this.productsList = await Product.getAllProductSelect(retouchStandard)
        }
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 删除照片
     */
    deletePhoto (item, photoItem) {
      photoItem.isDelete = true
    },
    /**
     * @description 获取请求数据
     */
    getModifyParams (item) {
      const photoData = item.photos.map(photoItem => {
        const createdData = {}
        createdData.photoId = photoItem.id
        createdData.peopleNum = photoItem.people_num

        if (photoItem.isJoint) {
          createdData.spliceMark = photoItem.jointClass
          createdData.splicePosition = photoItem.jointClassNum
        }

        createdData.isDelete = Boolean(photoItem.isDelete)
        return createdData
      })

      const hasEveryNumber = photoData.every(item => {
        const isString = item.peopleNum === ''
        if (item.isDelete) {
          return true
        } else {
          return !isString
        }
      })

      if (!hasEveryNumber) throw new Error('请输入人数')
      const req = {
        streamId: item.id,
        photos: photoData,
        productId: item.product.id
      }
      return req
    },
    /**
     * @description 提交修改
     */
    async modifyStream (item) {
      try {
        const req = this.getModifyParams(item)
        if (!req) return
        this.$store.dispatch('setting/showLoading', this.routeName)
        await WorkManage.modifyStream(req)
        this.$newMessage.success('操作成功!')
      } finally {
        await this.$delayLoading()
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 打开修复人数弹窗
     */
    showFixPeopleDialog (streamInfo) {
      this.selectStreamPhotos = streamInfo.photos.filter(photoItem => {
        return !photoItem.isDelete && photoItem.type !== PHOTO_TYPE.TEMPLATE_TYPE
      })
      this.batchFixVisible = true
    },
    /**
     * @description 批量修改前
     */
    handleClose () {
      this.batchFixVisible = false
      this.resetData()
    },
    /**
     * @description 重置相关信息
     */
    resetData () {
      this.selectStreamPhotos = []
      this.checkedPhotos = []
      this.checkAllPhoto = false
      this.isIndeterminate = false
      this.batchChangePeople = 0
    },
    /**
     * @description 确认更改人数
     */
    sureChangePeople () {
      if (!this.checkedPhotos.length) return this.$newMessage.warning('请选择更改的照片')
      this.selectStreamPhotos.forEach(item => {
        if (this.checkedPhotos.includes(item.id)) {
          item.people_num = this.batchChangePeople
        }
      })
      this.batchFixVisible = false
      this.resetData()
    },
    /**
     * @description 当照片选中
     */
    handleCheckedCitiesChange (value) {
      const checkedCount = value.length
      this.checkAllPhoto = checkedCount === this.selectStreamPhotos.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.selectStreamPhotos.length
    },
    /**
     * @description 选中全部照片
     */
    handleCheckAllChange (val) {
      this.checkedPhotos = val ? this.selectStreamPhotos.map(item => item.id) : []
      this.isIndeterminate = false
    }
  }
}
</script>

<style lang="less">

.amend-order {
  .tip-box {
    margin-bottom: 20px;
  }

  .caid-box {
    margin-bottom: 20px;

    .order-info {
      display: flex;
      align-items: center;

      .id {
        margin-right: 20px;
      }

      .batch-fix-people {
        margin-left: auto;
      }
    }

    .photo-list {
      margin-top: 20px;

      .photo-list-box {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        .photo-box {
          position: relative;
          width: 303px;
          margin-right: 24px;
          margin-bottom: 24px;

          .change-num {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 90%;
            padding: 10px 0;
            margin: auto;
            font-size: 12px;

            .disabled-input {
              color: #c0c4cc;
              cursor: not-allowed;
              background-color: #f5f7fa;
              border-color: #e4e7ed;
            }
          }

          .joint-type,
          .joint-sequence,
          .change-num {
            & > span {
              width: 48px;
              text-align: center;
            }
          }

          .joint-box {
            display: flex;
            width: 90%;
            padding: 0 0 10px;
            margin: auto;
            font-size: 12px;

            .joint-type {
              display: flex;
              align-items: center;
              width: 50%;

              .el-select {
                width: 80px;
              }
            }

            .joint-sequence {
              display: flex;
              align-items: center;
              width: 50%;

              .el-input {
                width: 80px;
              }
            }
          }

          .delete-button {
            position: absolute;
            top: -14px;
            right: -14px;
            display: none;
            cursor: pointer;
            transition: all 0.3s;

            .el-icon-error {
              font-size: 28px;
            }
          }

          &:hover .delete-button {
            display: block;
          }
        }

        .empty-box {
          width: 30%;
        }
      }

      .delete-all {
        margin-bottom: 20px;
        color: @red;

        i {
          font-size: 24px;
          color: #9f9fa0;
        }
      }
    }
  }

  .dialog-photo-list {
    display: flex;
    flex-wrap: wrap;

    .dialog-photo-box {
      width: 200px;
      padding: 6px;
      background-color: #f5f7fa;
      border-radius: 4px;
    }

    .operation-module {
      display: flex;
      align-items: center;

      .batch-change-people-box {
        display: flex;
        align-items: center;
        width: 100%;

        .batch-label {
          flex-shrink: 0;
        }

        .change-input {
          width: 180px;
        }
      }
    }
  }

  .checkbox-photo {
    position: relative;
    margin: 0 10px 10px 0;

    .el-checkbox__input {
      position: absolute;
      right: 10px;
      bottom: 10px;
    }

    .el-checkbox__label {
      padding: 0;
    }
  }

  .check-all {
    width: 100%;

    .el-checkbox__input {
      position: relative;
    }
  }
}

</style>
