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

const IDENTIFY_STATE = {
  'BEFOR_UPDATE': 'beforeUpdate',
  'UPDATEING': 'updateing',
  'IDENTIFYING': 'identifying',
  'IDENTIFY_DONE': 'identifyDone'
}

export default {
  name: 'IdentifyUpdate',
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
    ...mapGetters(['updateDomain']),
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
    beforeUpload () {
      this.$emit('update:state', IDENTIFY_STATE.UPDATEING)
    },
    handleProgress (event, file, fileList) {
      this.percentageAge = Number(Math.floor(event.percent / 2))
    },
    async handleSuccess (response, file, fileList) {
      this.$emit('update:state', IDENTIFY_STATE.IDENTIFYING)
      const path = ''
      this.$emit('uploadSuccess', path)
    },
    handleError () {
      // TODO
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
