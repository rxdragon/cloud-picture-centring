<template>
  <div class="reference-photo">
    <el-image
      class="reference-img"
      fit="contain"
      :src="src"
      :preview-src-list="[src]"
    >
    </el-image>
    <span class="dowm-text" type="text" @click="downPhoto()">下载参考图</span>
  </div>
</template>

<script>
import DownIpc from '@electronMain/ipc/DownIpc'

export default {
  name: 'ReferencePhoto',
  props: {
    src: { type: String, default: '' },
    streamNum: { type: String, default: '' }
  },
  methods: {
    /**
     * @description 下载照片
     */
    downPhoto () {
      const data = {
        url: this.src,
        path: this.streamNum
      }
      this.$newMessage.success('已添加一张照片到下载')
      DownIpc.addDownloadFile(data)
    }
  }
}
</script>

<style lang="less" scoped>
.reference-photo {
  display: flex;
  align-items: flex-end;

  .reference-img {
    width: 100px;
  }

  .dowm-text {
    margin-left: 10px;
    font-size: 14px;
    color: #aaa;
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
