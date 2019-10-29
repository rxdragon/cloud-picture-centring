<template>
  <div class="amend-order">
    <div class="header">
      <h3>修改照片产品</h3>
    </div>
    <div class="search-box">
      <div class="caid-search search-item">
        <span>流水号</span>
        <el-input v-model="caid" :disabled="Boolean(id)" placeholder="请输入流水号" />
      </div>
      <div class="caid-search search-item">
        <span>订单号</span>
        <el-input v-model="id" :disabled="Boolean(caid)" placeholder="请输入订单号" />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getStreamInfo">查 询</el-button>
      </div>
    </div>
    <div v-for="(item, index) in dataList" :key="index" class="caid-box module-panel">
      <div class="order-info ">
        <div class="id search-item">
          <span>流水号{{ index + 1 }}</span> {{ item.stream_num }}
        </div>
        <div class="product search-item">
          <span>拍摄产品</span>
          <el-select v-model="item.product.id" placeholder="请选择产品">
            <el-option
              v-for="(optionItem, pIndex) in item.order.products"
              :key="pIndex"
              :label="optionItem.name"
              :value="optionItem.id"
            />
          </el-select>
        </div>
      </div>
      <div class="photo-list">
        <div v-for="(photoItem, photoIndex) in item.photos" :key="photoIndex" class="photo-box">
          <template v-if="!photoItem.isDelete">
            <photo-box :src="photoItem.path" />
            <div class="change-num">
              <span>人数：</span>
              <el-input v-model="photoItem.people_num" size="mini" type="number" placeholder="请输入人数" />
            </div>
            <!-- 拼接信息 -->
            <div v-if="photoItem.isJoint" class="joint-box">
              <div class="joint-type">
                <span>拼接：</span>
                <el-select v-model="photoItem.jointClass" size="mini" placeholder="请选择">
                  <el-option v-for="(typeItem, typeIndex) in jointClassOption" :key="typeIndex" :label="typeItem.label" :value="typeItem.value" />
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
          </template>
        </div>
        <div class="empty-box" />
      </div>
      <div class="submit-box">
        <el-button type="primary" @click="modifyStream(item)">提交修改</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'
import * as WorkManage from '@/api/workManage'
import { jointClass } from '@/assets/config/jointClass.js'

export default {
  name: 'AmendOrder',
  components: { PhotoBox },
  data () {
    return {
      caid: '', // 流水号
      id: '', // 订单号
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
     * @description 获取照片订单信息
     */
    async getStreamInfo () {
      try {
        const req = {}
        if (this.id) { req.orderId = this.id }
        if (this.caid) { req.streamNum = this.caid }
        if (!Object.keys(req).length) {
          return this.$newMessage.warning('请输入订单号或流水号')
        }
        this.$store.dispatch('setting/showLoading', this.$route.name)
        this.dataList = await WorkManage.getStreamInfo(req)
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
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
        if (photoItem.isDelete) { createdData.isDelete = true }
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
        this.$store.dispatch('setting/showLoading', this.$route.name)
        await WorkManage.modifyStream(req)
        this.$newMessage.success('操作成功!')
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      } catch (error) {
        this.$newMessage.success('操作成功!')
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      }
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";
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
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-top: 20px;

      .photo-box {
        width: 303px;
        margin-right: 24px;
        margin-bottom: 24px;
        position: relative;

        .change-num {
          display: flex;
          align-items: center;
          width: 90%;
          margin: auto;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 12px;

          .el-input {
            width: calc(~'100% - 48px')
          }
        }

        .joint-type,
        .joint-sequence,
        .change-num {
          &>span {
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
            width: 50%;
            display: flex;
            align-items: center;

            .el-select {
              width: 80px;
            }
          }

          .joint-sequence {
            width: 50%;
            display: flex;
            align-items: center;

            .el-input {
              width: 80px;
            }
          }
        }

        .delete-button {
          position: absolute;
          right: -14px;
          top: -14px;
          display: none;
          transition: all 0.3s;
          cursor: pointer;

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

    .submit-box {
      text-align: center;
    }
  }
}

</style>
