<template>
  <div class="assessment-report module-panel">
    <cloud-report :role="CLOUD_ROLE.GROUP_LEADER" />
  </div>
</template>

<script>
import CloudReport from '@/components/CloudReport'
import { CLOUD_ROLE } from '@/utils/enumerate'

export default {
  name: 'AssessmentReport',
  components: { CloudReport },
  props: {},
  data () {
    return {
      CLOUD_ROLE
    }
  },
  methods: {
  }
}
</script>
