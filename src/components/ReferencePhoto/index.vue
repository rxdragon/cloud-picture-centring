<template>
  <div class="require-remark">
    <span>参考图：</span>
    <div class="remark-content require-reference-photo">
      <el-image
        class="reference-img"
        fit="contain"
        :src="src"
        :preview-src-list="[src]"
      >
      </el-image>
      <el-button type="text" @click="downPhoto()">下载参考图</el-button>
    </div>
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
.require-remark {
  display: flex;
  padding: 20px 0;
  border-top: 1px solid #dddfe6;

  & > span {
    width: 90px;
    font-size: 14px;
    color: #303133;
  }

  .remark-content {
    width: 632px;
    font-size: 14px;
    color: #303133;
    white-space: pre-wrap;
  }

  .require-background-color {
    display: flex;
    align-items: center;

    img {
      width: 50px;
      height: 50px;
      margin-right: 10px;
    }
  }

  .require-reference-photo {
    display: flex;
    align-items: flex-end;

    .reference-img {
      width: 200px;
      height: 200px;
    }
  }
}
</style>
