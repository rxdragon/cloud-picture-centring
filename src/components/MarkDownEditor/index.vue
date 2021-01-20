<template>
  <div class="markdown-editor">
    <div class="edit-content">
      <div ref="toastuiEditor" class="toastui-editor"></div>
    </div>
  </div>
</template>

<script>
import 'codemirror/lib/codemirror.css'
import '@toast-ui/editor/dist/i18n/zh-cn'
import '@toast-ui/editor/dist/toastui-editor.css'
import Editor from '@toast-ui/editor'
import defaultOptions from './default-options'
import { batchRegisterEvent } from './registerTool.js'
const editorEvents = ['load', 'change', 'stateChange', 'focus', 'blur']

export default {
  name: 'MarkdownEditor',
  model: {
    prop: 'value',
    event: 'change'
  },
  prop: {
    value: { type: String, default: '' }
  },
  data () {
    const eventOptions = {}
    editorEvents.forEach(event => {
      eventOptions[event] = (...args) => {
        let data = {...args}
        if (this.editor && event === 'change') {
          data = this.editor.getHtml()
        }
        this.$emit(event, data)
      }
    })

    const options = {
      ...defaultOptions,
      events: eventOptions
    }

    return {
      editor: null,
      computedOptions: options
    }
  },
  mounted () {
    this.initEditLayout()
  },
  destroyed () {
    editorEvents.forEach(event => {
      this.editor.off(event)
    })
    this.editor.remove()
    this.editor = null
  },
  methods: {
    initEditLayout () {
      const options = { ...this.computedOptions, el: this.$refs.toastuiEditor }
      this.editor = new Editor(options)
      batchRegisterEvent(this.editor)
    }
  }
}
</script>

<style lang="less" scoped>
.toastui-editor {
  height: 500px;
  line-height: 1;
}
</style>
