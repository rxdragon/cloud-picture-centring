<template>
  <div class="amend-order page-class">
    <div class="header">
      <h3>修改照片产品</h3>
    </div>
    <!-- 搜索模块 -->
    <div class="search-box">
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
      <div class="button-box">
        <el-button type="primary" @click="getStreamInfo">查 询</el-button>
      </div>
    </div>
    <!-- 订单照片显示模块 -->
    <div v-for="(item, index) in dataList" :key="index" class="caid-box module-panel">
      <div class="order-info ">
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
      </div>
      <div class="photo-list">
        <transition name="fade-transform" mode="out-in">
          <div v-if="!isAlldelete(item.photos)" key="photoList" class="photo-list-box">
            <div v-for="(photoItem, photoIndex) in item.photos" :key="photoIndex" :style="photoItem.isDelete && 'display: none;'">
              <div v-if="!photoItem.isDelete" class="photo-box">
                <photo-box :src="photoItem.path" />
                <div class="change-num">
                  <span>人数：</span>
                  <input
                    :disabled="photoItem.type === PHOTO_TYPE.TEMPLATE_TYPE"
                    :class="{ 'disabled-input': photoItem.type === PHOTO_TYPE.TEMPLATE_TYPE }"
                    v-model="photoItem.people_num"
                    v-numberOnly
                    class="fake-el-input"
                    min="0"
                    size="mini"
                    placeholder="请输入人数"
                  >
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
      jointClassOption: [] // 修图类别
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
        if (this.id) {
          req.externalNum = this.id
        }
        if (this.caid) {
          req.streamNum = this.caid
        }
        if (!Object.keys(req).length) {
          return this.$newMessage.warning('请输入订单号或流水号')
        }
        this.$store.dispatch('setting/showLoading', this.routeName)
        this.productsList = []
        this.dataList = await WorkManage.getStreamInfo(req)
        if (this.dataList.length) {
          const retouchStandard = this.dataList[0].product.retouch_standard
          this.productsList = await Product.getAllProductSelect(retouchStandard)
        }
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
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
        if (photoItem.isDelete) {
          createdData.isDelete = true
        }
        return createdData
      })
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
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$newMessage.success('操作成功!')
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    }
  }
}
</script>

<style lang="less">

.amend-order {
  .search-box {
    margin-bottom: 20px;

    .caid-search {
      .el-input {
        width: 200px;
      }
    }
  }

  .caid-box {
    margin-bottom: 20px;

    .order-info {
      display: flex;
      align-items: center;

      .id {
        margin-right: 20px;
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
}

</style>
