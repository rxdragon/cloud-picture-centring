<template>
  <div class="FabricCanvas">
    <canvas id="mark-canvas" ref="mark-canvas" />
  </div>
</template>

<script>
export default {
  name: 'FabricCanvas',
  props: {
    optionObj: { type: Object, required: true }
  },
  created () {
    console.log(this.optionObj)
  }
}
</script>