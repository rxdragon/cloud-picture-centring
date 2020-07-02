<template>
  <div class="identify-update">
    <el-upload
      v-if="canUpload"
      class="upload-main"
      drag
      :action="updateDomain"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-progress="handleProgress"
      :on-success="handleSuccess"
      :on-error="handleError"
      :data="upyunConfig"
    >
      <i class="el-icon-picture-outline"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <div class="progress-box" v-else>
      <identify-loading />
      <el-progress :percentage="percentage" :show-text="false" />
      <div class="progress-text">
        {{ identifyState === 'identifying' ? '识别中' : '上传中' }} {{ percentage }} %
      </div>
    </div>
  </div>
</template>

<script>
import * as Commonality from '@/api/commonality'
import { mapGetters } from 'vuex'
import IdentifyLoading from '@/components/IdentifyLoading'

const IDENTIFY_STATE = {
  'BEFOR_UPDATE': 'beforeUpdate',
  'UPDATEING': 'updateing',
  'IDENTIFYING': 'identifying',
  'IDENTIFY_DONE': 'identifyDone'
}

export default {
  name: 'IdentifyUpdate',
  components: { IdentifyLoading },
  props: {
    state: { type: String, required: true },
    identifyProgress: { type: Number, required: true }
  },
  data () {
    return {
      IDENTIFY_STATE,
      upyunConfig: {},
      percentageAge: 0
    }
  },
  computed: {
    ...mapGetters(['updateDomain', 'imgUploadDomain']),
    percentage () {
      return Number(Math.floor(this.percentageAge + this.identifyProgress))
    },
    identifyState () {
      return this.state
    },
    canUpload () {
      const canUploadState = [IDENTIFY_STATE.BEFOR_UPDATE, IDENTIFY_STATE.IDENTIFY_DONE]
      return canUploadState.includes(this.state)
    }
  },
  created () {
    this.getUpyunSign()
  },
  methods: {
    /**
     * @description 上传前
     */
    beforeUpload () {
      this.$emit('update:state', IDENTIFY_STATE.UPDATEING)
    },
    /**
     * @description 上传中
     */
    handleProgress (event, file, fileList) {
      this.percentageAge = Number(Math.floor(event.percent / 2))
    },
    /**
     * @description 上传成功
     */
    async handleSuccess (response, file, fileList) {
      this.$emit('update:state', IDENTIFY_STATE.IDENTIFYING)
      const sendMsg = {
        path: this.imgUploadDomain + response.url,
        file: file
      }

      this.$emit('uploadSuccess', sendMsg)
    },
    /**
     * @description 上传失败钩子
     * @param {*} err 错误信息
     * @param {*} file 上传失败单文件
     * @param {*} fileList 上传文件列表
     */
    handleError (err, file, fileList) {
      console.error(err)
      this.resetUpload()
    },
    /**
     * @description 重制上传
     */
    resetUpload () {
      this.percentageAge = 0
      this.$emit('update:state', IDENTIFY_STATE.BEFOR_UPDATE)
    },
    /**
     * @description 获取又拍云
     */
    async getUpyunSign () {
      this.upyunConfig = await Commonality.getSignature()
    }
  }
}
</script>
