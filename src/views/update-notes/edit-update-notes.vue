<template>
  <div class="edit-update" v-loading="loading">
    <div class="header">
      <h3>新增更新</h3>
    </div>
    <el-form ref="versionform" :model="versionForm" :rules="rules" label-width="80px">
      <el-form-item label="版本名称" prop="id">
        <el-select
          v-model="versionForm.id"
          allow-create
          filterable
          placeholder="请输入版本名称"
          @change="changeVersion"
        >
          <el-option
            v-for="versionItem in allVersionNum"
            :key="versionItem.id"
            :label="versionItem.version_num"
            :value="versionItem.id">
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
      <el-button class="save-button" type="primary" @click="save">保存</el-button>
      <el-button class="save-button" type="info" @click="templateData">模版</el-button>
    </el-form>
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
import defaultOptions from './assets/default-options'
import templateInfo from './assets/template.js'
import { batchRegisterEvent } from './registerTool.js'
import { parseTime } from '@/utils/index.js'
import * as Version from '@/api/version.js'

export default {
  name: 'editUpdateNotes',
  data () {
    return {
      rules: {
        time: [{ required: true, message: '请选择日期', trigger: 'change' }],
        id: [{ required: true, message: '请输入版本名称', trigger: 'change' }]
      },
      editorOptions: defaultOptions,
      editor: null,
      versionForm: {
        num: '',
        time: '',
        id: ''
      },
      allVersionNum: [],
      loading: false
    }
  },
  created () {
    this.getAllVersionNum()
  },
  mounted () {
    const options = { ...this.editorOptions, el: this.$refs.toastuiEditor }
    this.editor = new Editor(options)
    batchRegisterEvent(this.editor)
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
          this.setEmpty()
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
     * @description 更改版本
     */
    async changeVersion (value) {
      try {
        const selectVersion = this.allVersionNum.find(item => item.id === this.versionForm.id)
        if (selectVersion) {
          this.versionForm.time = _.get(selectVersion, 'version_time') || ''
          this.versionForm.num = _.get(selectVersion, 'version_num') || ''
          this.loading = true
          const params = {
            versionNum: this.versionForm.num,
            page: 1,
            pageSize: 1
          }
          const res = await Version.getVersionInfo(params)
          const versioncontent = res.data[0].info
          this.editor.setHtml(versioncontent)
        } else {
          this.versionForm.time = ''
          this.versionForm.num = ''
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    /**
     * @description 清空编辑器
     */
    setEmpty () {
      this.$refs['versionform'].resetFields()
      this.editor.setHtml('')
    },
    /**
     * @description 模版数据
     */
    templateData () {
      this.editor.setMarkdown(templateInfo)
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

  .el-form {
    display: flex;

    .el-form-item {
      margin-right: 25px;
    }

    .save-button {
      margin-bottom: 22px;
    }
  }

  .edit-content {
    display: flex;
    height: calc(@appMainHeight - 88px);

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
}
</style>

