<template>
  <div class="photo-grade-box">
    <div class="photo-num info-box">
      <label class="data-label">照片编号：</label>
      <div class="data-value">{{ photoData.photoIndex }}</div>
    </div>
    <div class="product-info">
      <div class="info-box">
        <label class="data-label">修图标准：</label>
        <div class="data-value">{{ photoData.productInfo.type | toRetouchClass }}
          <div class="standard-icon">
            <div :class="`iconmap-standard-${photoData.productInfo.type}`" />
          </div>
        </div>
      </div>
      <div class="info-box">
        <label class="data-label">产品名称：</label>
        <el-tooltip :content="photoData.productInfo.productName" placement="top">
          <div class="data-value product-name">
            {{ photoData.productInfo.productName }}
          </div>
        </el-tooltip>
      </div>
    </div>
    <div class="photo-list">
      <div class="photo-gulp"
        v-for="item in photoData.photoInfo.photoVersion" :key="item.id"
        @click="startGrade">
        <div class="photo-version">{{ item.version | toPhotoVerName }}</div>
        <photo-box :src="item.path" preload-photo />
      </div>
    </div>
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'

export default {
  name: 'PhotoGradeBox',
  components: { PhotoBox },
  props: {
    photoInfo: { type: Object, required: true }
  },
  data () {
    return {}
  },
  computed: {
    photoData () {
      return this.photoInfo
    }
  },
  created () {
    console.log(this.photoInfo)
  },
  methods: {
    startGrade () {
      this.$emit('startGrade', this.photoData.batchUUId)
      console.log(this.data)
    }
  }
}
</script>

<style lang="less" scoped>
.photo-grade-box {
  width: 357px;
  height: 244px;
  padding: 20px 0 20px 20px;
  margin: 0 20px 20px 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.06);

  .info-box {
    display: flex;

    .data-value,
    .data-label {
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: #303133;
    }

    .product-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
    }
  }

  .photo-num {
    margin-bottom: 4px;
  }

  .product-info {
    display: flex;

    .info-box {
      margin-right: 20px;
    }
  }

  .photo-list {
    height: 140px;
    margin-top: 16px;
    display: flex;

    .photo-gulp {
      width: 140px;
      height: 140px;
      margin-right: 20px;
      border-radius:4px;
      overflow: hidden;
      position: relative;

      .photo-version {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9;
        padding: 0 7px;
        font-size: 12px;
        background: rgba(0, 0, 0, 0.6);
        border-radius:1px 1px 4px 1px;
        color: #eee;
        font-weight: 400;
        line-height: 17px;
      }
    }
  }
}
</style>
