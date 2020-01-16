<template>
  <div class="lekima-select">
    <el-select
      v-bind="$attrs"
      :popper-append-to-body="false"
      clearable
      v-on="$listeners"
    >
      <el-option
        v-for="(optionItem, optionIndex) in options"
        :key="optionIndex"
        :label="optionItem.label"
        :value="optionItem.value"
      />
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'LekimaSelect',
  data () {
    return {
      options: [{
        label: '是',
        value: 1
      }, {
        label: '否',
        value: 0
      }]
    }
  }
}
</script>
