<template>
  <div class="impression-maps">
    <el-dialog
      :title="`${isEdit ? '修改' : '新增'}拍摄底色`"
      width="30%"
      center
      custom-class="impression-dialog"
      :visible="true"
      :before-close="closeDiglog"
    >
      <div class="impression-maps-content">
        <div class="photography-name">
          <div class="panel-title">拍摄底色名称</div>
          <el-input
            v-model="editData.photographyName"
            placeholder="请输入拍摄底色名称"
            show-word-limit
            maxlength="8"
          />
        </div>

        <div class="photography-photo">
          <div class="panel-title">拍摄底色图片</div>
          <LightingPointPhoto v-model="editData.imgPath" :maxNum="1"/>
        </div>
        
        <div class="retouch-photo">
          <div class="panel-title">选择修图底色</div>
          <BackColorsSelect multiple collapse-tags v-model="editData.retouchColorId" />
        </div>

        <!-- 选中颜色列表 -->
        <div class="color-map">
          <div class="color-image" v-for="(colorItem, colorIndex) in selectColors" :key="colorIndex">
            <el-image class="back-image" :src="colorItem.colorPath" />
            <span class="color-name">{{ colorItem.name }}</span>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="sumbitData">确 定</el-button>
        <el-button size="mini" type="info" @click="closeDiglog">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import LightingPointPhoto from './LightingPointPhoto'
import BackColorsSelect from '@SelectBox/BackColorsSelect'
import * as CommonalityApi from '@/api/commonality.js'
import { mapGetters } from 'vuex'
import uuidv4 from 'uuid'

export default {
  name: 'ImpressionMaps',
  components: { LightingPointPhoto, BackColorsSelect },
  props: {
    editInfo: { type: Object, default: null }
  },
  data () {
    return {
      backColorMap: [],
      editData: {},
      isEdit: false
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    // 选中颜色
    selectColors () {
      const createColor = []
      this.editData.retouchColorId.forEach(colorId => {
        const findBackColor = this.backColorMap.find(item => item.value === colorId)
        if (findBackColor) {
          createColor.push({
            colorPath: findBackColor.compressPath,
            name: findBackColor.label
          })
        }
      })
      return createColor
    }
  },
  created () {
    this.getColorBackColorMap()
    if (this.editInfo) {
      this.editData = JSON.parse(JSON.stringify(this.editInfo))
      this.isEdit = true
    } else {
      this.isEdit = false
      this.editData = {
        uuid: uuidv4(),
        photographyName: '',
        imgPathShow: '',
        imgPath: [],
        retouchColorId: [],
        retouchColorPath: []
      }
    }
  },
  methods: {
    /**
     * @description 获取颜色列表
     */
    async getColorBackColorMap () {
      this.backColorMap = await CommonalityApi.getBackColors()
    },
    /**
     * @description 添加参数
     */
    sumbitData () {
      const isEveryUploaded = this.editData.imgPath.every(item => item.status === 'success')
      if (!isEveryUploaded) return this.$newMessage.warning('请等待底片上传完成')
      if (!this.editData.imgPath.length) return this.$newMessage.warning('请添加底色图')
      if (!this.editData.photographyName) return this.$newMessage.warning('请添加拍摄底色名字')
      if (!this.editData.retouchColorId.length) return this.$newMessage.warning('请选择修图底色')

      let imgPath = this.editData.imgPath[0].path || ''
      if (!imgPath.includes('http')) {
        imgPath = this.imgDomain + imgPath
      }
      this.editData.imgPathShow = imgPath
      this.editData.imgPath[0].url = imgPath

      this.editData.retouchColorPath = this.selectColors
      if (this.editInfo) {
        this.$emit('editImpression', this.editData)
      } else {
        this.$emit('addNew', this.editData)
      }
    },
    /**
     * @description 关闭窗口
     */
    closeDiglog () {
      this.$emit('update:show', false)
    }
  }
}
</script>

<style lang="less">
.impression-dialog {
  .photography-name {
    width: 100%;
    margin-bottom: 24px;

    .el-input {
      width: 100%;
    }
  }

  .photography-photo {
    margin-bottom: 24px;
  }

  .color-map {
    display: flex;
    flex-wrap: wrap;
    margin-top: 12px;
    margin-right: -8px;
    margin-bottom: -8px;

    .color-image {
      display: inline-flex;
      flex-direction: column;
      margin-right: 8px;
      margin-bottom: 8px;

      .back-image {
        width: 60px;
        height: 60px;
        border-radius: 4px;
      }

      .color-name {
        width: 60px;
        overflow: hidden;
        font-size: 12px;
        font-weight: 400;
        line-height: 17px;
        color: #606266;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
