<template>
  <div class="modify-history">
    <div class="header">
      <h3>云学院评价修改</h3>
    </div>
    <ModifyHistoryModule />
  </div>
</template>

<script>
import ModifyHistoryModule from '@AssessmentComponents/ModifyHistoryModule/index.vue'
import { GRADE_LABEL_TYPE } from '@/utils/enumerate.js'

export default {
  name: 'ModifyHistory',
  components: { ModifyHistoryModule },
  provide: {
    cloudType: GRADE_LABEL_TYPE.CLOUD
  }
}
</script>
