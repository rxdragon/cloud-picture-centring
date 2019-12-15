<template>
  <div class="photo">
    <div class="img-box">
      <div v-if="jointLabel" class="joint-label">拼接照{{ jointLabel | filterJointLabel }}</div>
      <el-image :src="imageSrc" fit="cover" :preview-src-list="getPreviewPhoto">
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline" />
          <span>加载失败...</span>
        </div>
      </el-image>
      <span v-if="photoName" class="photo-name" @click.stop="">{{ src }}</span>
    </div>
    <div v-if="downing || peopleNum" class="handle-box" @click.stop="">
      <el-button v-if="downing" type="text" @click.stop.capture="downingPhoto">下载照片</el-button>
      <span v-if="peopleNum" class="people-num">人数：{{ peopleNum }}</span>
      <slot name="title" />
    </div>
    <div v-if="storeReworkReason" class="recede-reason">
      门店退回原因： <span class="reason-content">{{ storeReworkReason }}</span>
    </div>
    <div v-if="storeReworkNote" class="recede-reason">
      门店退回备注： <span class="reason-content">{{ storeReworkNote }}</span>
    </div>
    <div v-if="recedeReason" class="recede-reason">
      审核退回原因： <span class="reason-content">{{ recedeReason }}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DownIpc from '@electronMain/ipc/DownIpc'
export default {
  name: 'PhotoBox',
  filters: {
    filterJointLabel (jointLabel) {
      return jointLabel[1]
        ? `${jointLabel[0]}-${jointLabel[1]}`
        : jointLabel[0]
    }
  },
  props: {
    src: { type: String, default: '' }, // 地址图片
    photoName: { type: Boolean },
    peopleNum: { type: [String, Number], default: () => '' }, // 是够显示照片人数
    downing: { type: Boolean }, // 是够开启下载功能
    preview: { type: Boolean }, // 是否开启单张预览功能
    previewBreviary: { type: Boolean }, // 开启单张缩略预览功能
    showRecedeReason: { type: Boolean }, // 是否显示退单理由
    showJointLabel: { type: Boolean }, // 是否显示拼接照信息
    tags: { type: Object, default: () => {
      return null
    } }, // 标记信息
    streamNum: { type: String, default: '' } // 流水号
  },
  data () {
    return {
      breviary: '!thumb.small.50'
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    // 拼接信息
    jointLabel () {
      if (this.showJointLabel && this.tags && this.tags.values && this.tags.values.splice_mark) {
        return [this.tags.values.splice_mark, this.tags.values.splice_position]
      } else {
        return null
      }
    },
    // 重修理由
    recedeReason () {
      if (this.showRecedeReason && this.tags && this.tags.values && this.tags.values.rework_reason) {
        return this.tags.values.rework_reason
      } else {
        return ''
      }
    },
    storeReworkReason () {
      if (this.showRecedeReason && this.tags && this.tags.values && this.tags.values.store_rework_reason) {
        return this.tags.values.store_rework_reason
      } else {
        return ''
      }
    },
    storeReworkNote () {
      if (this.showRecedeReason && this.tags && this.tags.values && this.tags.values.store_rework_note) {
        return this.tags.values.store_rework_note
      } else {
        return ''
      }
    },
    // 压缩图片地址
    imageSrc () {
      return this.imgDomain + this.src + this.breviary
    },
    // 展示图片
    getPreviewPhoto () {
      if (this.preview) {
        return [this.imgDomain + this.src]
      } else if (this.previewBreviary) {
        return [this.imgDomain + this.src + this.breviary]
      } else {
        return []
      }
    }
  },
  methods: {
    /**
     * @description 下载成功
     */
    downingPhoto () {
      const savePath = `/${this.streamNum}`
      const data = {
        url: this.imgDomain + this.src,
        path: savePath
      }
      this.$newMessage.success('已添加一张照片到下载')
      DownIpc.addDownloadFile(data)
    }
  }
}
</script>

<style lang="less">
@import '../../styles/variables.less';

.img-box {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
  border-radius: 4px;
  overflow: hidden;

  .joint-label {
    position: absolute;
    top: 0;
    z-index: 100;
    width: 100%;
    text-align: center;
    font-size: 12px;
    background: @jointLabelColor;
    line-height: 16px;
    color: @blue;
  }

  .photo-name {
    position: absolute;
    bottom: 0;
    background: @gradualTransparent;
    color: #fff;
    font-size: 12px;
    line-height: 16px;
    width: 100%;
    padding: 10px;
    word-break: break-all;
  }

  .el-image {
    width: 100%;
    height: 100%;
    position: absolute;

    img {
      object-position: top;
    }
  }

  .image-slot {
    color: #909399;
    background-color: #f5f7fa;
    height: 100%;
    font-size: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    span {
      font-size: 16px;
      margin-top: 20px;
    }
  }
}

.handle-box {
  display: flex;
  justify-content: space-between;
  padding: 12px 6px 6px;

  .el-button {
    line-height: 17px;
    font-size: 12px;
    font-weight: 400;
    padding: 0;
  }

  .people-num {
    font-size: 12px;
    font-weight: 400;
    color: #606266;
    line-height: 17px;
  }
}

.recede-reason {
  font-size: 12px;
  color: @red;
  margin: 0 6px 6px;
  padding-top: 9px;
  border-top: 1px solid #ebeef5;
  line-height: 20px;

  .reason-content {
    color: #606266;
    word-break: break-all;
  }
}
</style>
