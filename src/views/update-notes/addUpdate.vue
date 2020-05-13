<template>
  <div class="edit-update">
    <el-form ref="versionform" :model="versionForm" :rules="rules" label-width="80px">
      <div class="header edit-title">
        <el-form-item label="版本名称" prop="name">
          <el-input v-model="versionForm.name" placeholder="请输入版本名称"></el-input>
        </el-form-item>
          <el-form-item label="更新时间" prop="time">
            <el-date-picker
              v-model="versionForm.time"
              type="date"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="save">保存</el-button>
          </el-form-item>
          <el-tooltip class="item" effect="dark" placement="right">
            <div slot="content" class="copy-tips">
              更改字体颜色将文字置于{{ tips }}内
              <div class="copy-icon-bo"><i class="el-icon-document-copy" @click="copyExample"></i></div>
            </div>
            <i class="el-icon-question"></i>
          </el-tooltip>
      </div>
      <div ref="toastuiEditor"></div>
    </el-form>
  </div>
</template>
<script>
import Editor from 'tui-editor'
import 'codemirror/lib/codemirror.css' // codemirror
import 'tui-editor/dist/tui-editor.css' // editor ui
import 'tui-editor/dist/tui-editor-contents.css' // editor content
import defaultOptions from './components/MarddownViewer/default-options'

export default {
  name: 'ToastuiEditor',
  mixins: [defaultOptions],
  computed: {
    editorOptions () {
      const options = defaultOptions
      options.height = 'auto'
      options.language = 'zh_CN'
      return options
    }
  },
  data () {
    return {
      versionForm: {},
      rules: {
        time: [
          { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入版本名称', trigger: 'blur' },
        ]
      },
      versionContent: '',
      tips: '<font face="黑体" color=green size=3>文字</font>',
    }
  },
  mounted () {
    const options = { ...this.editorOptions, el: this.$refs.toastuiEditor }
    this.editor = new Editor(options)
  },
  methods: {
    getRootElement () {
      return this.$refs.toastuiEditor
    },
    save () {
      this.$refs['versionform'].validate((valid) => {
        if (valid) {
          //
        }
      })
    },
    copyExample () {
      const tag = document.createElement('input')
      tag.setAttribute('id', 'cp_input')
      tag.value = this.tips
      document.getElementsByTagName('body')[0].appendChild(tag)
      document.getElementById('cp_input').select()
      document.execCommand('copy')
      document.getElementById('cp_input').remove()
    }
  }
}
</script>
<style lang="less" scoped>
.edit-update {
  .edit-title {
    justify-content: flex-start;
  }

  .copy-tips {
    display: flex;
  }

  .el-icon-question {
    position: absolute;
    right: 20px;
    font-size: 25px;
  }

  .copy-icon-box {
    cursor: pointer;
  }
}
</style>
