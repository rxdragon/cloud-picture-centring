<template>
  <div class="simulate-photos">
    <div class="panel-title">相似照片</div>
    <div class="simulate-list">
      <div class="simulate-photo-item" v-for="item in 14" :key="item" >
        <el-checkbox :value="radio === item" :label="item" @click.native.prevent="selectPhotoIndx(item)" >
          <photo-box class="photo-box" :src="selectPhoto" />
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
  data () {
    return {
      selectPhoto: '2020/05/05/lkWd_6m82023L3kcvVyDxIGoPN0V.jpg',
      radio: 1
    }
  },
  methods: {
    selectPhotoIndx (index) {
      this.radio = index
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
