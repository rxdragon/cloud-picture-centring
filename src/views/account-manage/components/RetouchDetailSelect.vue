<template>
  <div class="retouch-select-box">
    <div class="search-item">
      <span>修图等级</span>
      <retouch-rank-select v-model="listParams.retouchRank" import-model />
    </div>
    <div class="search-item">
      <span>海草值</span>
      <el-input v-model="listParams.retouchRank" placeholder="根据修图等级自动调整" />
    </div>
    <div class="search-item">
      <span>修图身份</span>
      <Retouch-kind-select v-model="listParams.retouchIdentity" />
    </div>
    <div class="search-item">
      <span>修图类别</span>
      <retouch-type-select v-model="listParams.retouchType" import-model />
    </div>
  </div>
</template>

<script>
import RetouchTypeSelect from '@SelectBox/RetouchTypeSelect'
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'
import RetouchRankSelect from '@SelectBox/RetouchRankSelect'
export default {
  name: 'RetouchDetailSelect',
  components: { RetouchTypeSelect, RetouchKindSelect, RetouchRankSelect },
  props: {
    listParams: { type: Object, default: () => ({
      retouchRank: '',
      plantValue: 0,
      retouchIdentity: '',
      retouchType: ''
    }) }
  },
  data () {
    return {
      options: [{
        rank: 1,
        plantNum: 100
      },{
        rank: 2,
        plantNum: 200
      }]
    }
  },
  watch: {
    'listParams.retouchRank': {
      handler (val) {
        const selectedRank = this.options.find(rankItem => rankItem.rank === val)
        if (selectedRank) {
          this.listParams.plantValue = selectedRank.plantNum
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.retouch-select-box {
  .search-item {
    margin: 24px 0;

    & > span {
      width: 56px;
    }

    .el-input {
      width: 194px;
    }
  }
}
</style>
