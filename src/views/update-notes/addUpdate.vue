<template>
  <div class="edit-update">
    <el-form ref="versionform" :model="versionForm" :rules="rules" label-width="80px">
      <div class="header">
        <h3>新增更新</h3>
        <el-tooltip class="item" effect="dark" placement="left" popper-class='copy-tips'>
          <div slot="content" class="copy-tips">
            更改字体颜色或大小将文字置于{{ tips }}内
            <p>段落标题可使用" > "符号置于段落之前，样式将自动显示</p>
            <p>点击右侧<i class="el-icon-question"></i>可复制标签</p>
          </div>
          <div class='copy-icon-box' @click="copyExample"><i class="el-icon-question"></i></div>
        </el-tooltip>
      </div>
      <div class="search-box fix-box">
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
          <el-button type="primary" @click="save">新增</el-button>
        </el-form-item>
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
import * as versionInfo from '@/api/version.js'
import { parseTime } from '@/utils/index.js'

export default {
  name: 'editUpdateNotes',
  mixins: [defaultOptions],
  computed: {
    editorOptions () {
      const options = defaultOptions
      return options
    }
  },
  data () {
    return {
      versionForm: {
        name: '',
        time: ''
      },
      rules: {
        time: [
          { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入版本名称', trigger: 'blur' },
        ]
      },
      tips: '<font face="黑体" color=green size=2>文字</font>',
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
    helpClick () {
      // console.log(1)
    },
    save () {
      this.$refs['versionform'].validate((valid) => {
        if (valid) {
          const params = {
            versionNum: this.versionForm.name.trim(),
            versionTime: parseTime(this.versionForm.time),
            info: this.editor.getHtml()
          }
          versionInfo.addVersionInfo(params).then( res => {
            if (res) {
              this.$newMessage.success('添加成功')
              this.$router.push({
                path: '/update-notes/update-notes-list'
              })
            } else {
              this.$newMessage.error('添加失败')
            }
          }).catch(() => {
            this.$newMessage.error('添加失败')
          })
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
  .el-icon-question {
    font-size: 25px;
  }

  pre {
    border-left: 10px solid red;
  }

  .copy-icon-box {
    cursor: pointer;
  }
}
</style>
