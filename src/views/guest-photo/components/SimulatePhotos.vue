<template>
  <div class="simulate-photos">
    <div class="panel-title">相似照片</div>
    <div class="simulate-list">
      <div class="simulate-photo-item" v-for="photoItem in similarityImageList" :key="photoItem.id" >
        <el-checkbox
          :value="radio === photoItem.id"
          :label="photoItem.id"
          @click.native.prevent="selectPhotoIndx(photoItem.id)"
        >
          <photo-box class="photo-box" contain-photo :src="productionDomain + photoItem.path" />
        </el-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'

export default {
  name: 'SimulatePhotos',
  components: { PhotoBox },
  props: {
    similarityImageList: { type: Array, required: true },
    selectPhotoId: { type: String, default: '' }
  },
  data () {
    return {
      productionDomain: 'https://cloud.cdn-qn.hzmantu.com/compress/'
    }
  },
  computed: {
    photoList () {
      return this.similarityImageList
    },
    radio () {
      return this.selectPhotoId
    }
  },
  methods: {
    /**
     * @description 选择照片
     */
    selectPhotoIndx (id) {
      this.$emit('update:selectPhotoId', id)
    }
  }
}
</script>

<style lang="less" scoped>
.simulate-photos {
  .panel-title {
    margin-bottom: 20px;
  }

  .simulate-list {
    display: flex;
    overflow-x: overlay;

    &::-webkit-scrollbar {
      height: 5px;
    }

    .simulate-photo-item {
      position: relative;
      margin-right: 20px;

      & /deep/ .el-checkbox__input {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 99;
      }

      & /deep/ .el-checkbox__label {
        display: block;
        width: 200px;
        height: 200px;
        padding: 0;
      }
    }

    .photo-box {
      width: 200px;

      &:nth-last-of-type(1) {
        margin-right: 0;
      }
    }
  }
}
</style>
