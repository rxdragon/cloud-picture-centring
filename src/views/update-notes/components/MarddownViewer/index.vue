<template>
  <div :id="id" class="markdown-editor" />
</template>

<script>
// deps for editor
import 'codemirror/lib/codemirror.css' // codemirror
import 'tui-editor/dist/tui-editor.css' // editor ui
import 'tui-editor/dist/tui-editor-contents.css' // editor content

import Viewer from 'tui-editor/dist/tui-editor-Viewer'
// import Editor from 'tui-editor'
import defaultOptions from './default-options'

export default {
  name: 'MarddownViewer',
  props: {
    value: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      required: false,
      default () {
        return 'markdown-editor-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')
      }
    },
    options: {
      type: Object,
      default () {
        return defaultOptions
      }
    },
    mode: {
      type: String,
      default: 'markdown'
    },
    height: {
      type: String,
      required: false,
      default: 'auto'
    }
  },
  data () {
    return {
      editor: null
    }
  },
  computed: {
    editorOptions () {
      const options = Object.assign({}, defaultOptions, this.options)
      options.initialEditType = this.mode
      options.height = this.height
      options.language = 'zh_CN'
      return options
    }
  },
  watch: {
    height (newValue) {
      this.editor.height(newValue)
    },
    mode (newValue) {
      this.editor.changeMode(newValue)
    }
  },
  mounted () {
    this.initEditor()
  },
  destroyed () {
    this.destroyEditor()
  },
  methods: {
    initEditor () {
      this.editor = new Viewer({
        el: document.getElementById(this.id),
        initialEditType: 'wysiwyg',
        ...this.editorOptions
      })
      this.editor.setValue(this.value)
    },
    destroyEditor () {
      if (!this.editor) return
      this.editor.remove()
    }
  }
}
</script>

<style lang="less">
.markdown-editor {
  blockquote {
    padding: 5px 15px;
    font-size: 16px;
    font-weight: 900;
    background-color: #efeeee;
    border-color: #42b983;
    border-left-style: solid;
    border-left-width: 4px;

    p {
      color: #545454;
    }
  }

  strong {
    padding: 1px 5px;
    font-size: 11px;
    color: #ff502c;
    vertical-align: baseline;
    background-color: #fff5f5;
    border-radius: 3px;
  }

  .mark-new {
    color: #3bbc7f;
  }

  .mark-opt {
    color: #ff8f00;
  }

  .mark-fix {
    color: #ff3974;
  }
}
</style>
