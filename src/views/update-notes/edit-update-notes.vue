<template>
  <div class="edit-update" v-loading="loading">
    <el-form ref="versionform" :model="versionForm" :rules="rules" label-width="80px">
      <div class="header">
        <h3>新增更新</h3>
        <el-tooltip class="item" effect="dark" placement="left" popper-class="test-class">
          <div slot="content">
            更改字体颜色或大小将文字置于{{ copyTips[0] }}内
            <p>点击关键字可复制该关键字样式</p>
            <span class="mark-new" @click="copyExample(copyTips[1])">增加</span>
            <span class="mark-opt" @click="copyExample(copyTips[2])">优化</span>
            <span class="mark-fix" @click="copyExample(copyTips[3])">修复</span>
          </div>
          <div class='copy-icon-box' @click="copyExample(copyTips[0])"><i class="el-icon-question"></i></div>
        </el-tooltip>
      </div>
      <div class="search-box fix-box">
        <el-form-item label="版本名称" prop="num">
          <el-select
            v-model="versionForm.num"
            allow-create
            filterable
            placeholder="请输入版本名称"
            @change="changeVersion"
          >
            <el-option
              v-for="versionItem in allVersionNum"
              :key="versionItem.id"
              :label="versionItem.version_num"
              :value="versionItem.version_num">
            </el-option>
          </el-select>
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
      </div>
      <div class="edit-content">
        <div ref="toastuiEditor" class="toastui-editor"></div>
      </div>
    </el-form>
  </div>
</template>
<script>
import 'codemirror/lib/codemirror.css' // codemirror
import 'tui-editor/dist/tui-editor.css' // editor ui
import 'tui-editor/dist/tui-editor-contents.css' // editor content
import Editor from 'tui-editor'
import defaultOptions from './components/MarddownViewer/default-options'
import { parseTime } from '@/utils/index.js'
import * as Version from '@/api/version.js'

export default {
  name: 'editUpdateNotes',
  data () {
    return {
      rules: {
        time: [{ required: true, message: '请选择日期', trigger: 'change' }],
        num: [{ required: true, message: '请输入版本名称', trigger: 'blur' }]
      },
      editorOptions: defaultOptions,
      editor: null,
      versionForm: {
        num: '',
        time: '',
        id: 0
      },
      allVersionNum: [],
      copyTips: [
        '<font face="黑体" color=green size=2>文字</font>',
        '<font face="黑体" color=#3bbc7f size=2>增加</font>',
        '<font face="黑体" color=#ff8f00 size=2>优化</font>',
        '<font face="黑体" color=#ff3974 size=2>修复</font>'
      ],
      loading: false
    }
  },
  computed: {
    dd () {
      return this.editor.getHtml()
    }
  },
  created () {
    this.getAllVersionNum()
  },
  mounted () {
    const options = { ...this.editorOptions, el: this.$refs.toastuiEditor }
    this.editor = new Editor(options)
  },
  methods: {
    /**
     * @description 获取版本
     */
    async getAllVersionNum () {
      const data = await Version.getAllVersionNum()
      this.allVersionNum = data
    },
    /**
     * @description 保存
     */
    async save () {
      try {
        this.loading = true
        await this.$refs['versionform'].validate()
        const params = {
          versionNum: this.versionForm.num.trim(),
          versionTime: parseTime(this.versionForm.time),
          info: this.editor.getHtml()
        }
        if (this.versionForm.id) {
          params.id = this.versionForm.id
          await Version.updateVersionInfo(params)
          this.$newMessage.success('修改成功')
          this.editor.setHtml('')
        } else {
          await Version.addVersionInfo(params)
          this.$newMessage.success('添加成功')
          this.$router.push({
            path: '/update-notes/update-notes-list'
          })
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    /**
     * @description 拷贝样式
     */
    copyExample (val) {
      const tag = document.createElement('input')
      tag.setAttribute('id', 'cp_input')
      tag.value = val
      document.getElementsByTagName('body')[0].appendChild(tag)
      document.getElementById('cp_input').select()
      document.execCommand('copy')
      document.getElementById('cp_input').remove()
    },
    /**
     * @description 更改版本
     */
    async changeVersion (value) {
      try {
        const selectVersion = this.allVersionNum.find(item => item.version_num === this.versionForm.num)
        if (selectVersion) {
          this.versionForm.time = _.get(selectVersion, 'version_time') || ''
          this.versionForm.id = _.get(selectVersion, 'id') || 0
          this.loading = true
          const params = {
            versionNum: this.versionForm.num,
            page: 1,
            pageSize: 1
          }
          const res = await Version.getVersionInfo(params)
          this.editor.setHtml(res.data[0].info)
        } else {
          this.versionForm.time = ''
          this.versionForm.id = 0
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@/styles/variables.less";

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

  .el-form-item {
    margin-right: 25px;
  }

  .edit-content {
    display: flex;
    height: calc(@appMainHeight - 88px);
  }

  /deep/ .toastui-editor {
    width: 100%;

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
  }
}
</style>

<style lang="less">
.test-class {
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
