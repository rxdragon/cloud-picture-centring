<template>
  <div class="create-announcement">
    <!-- 标题 -->
    <div class="header">
      <h3>创建公告</h3>
      <div class="header-plugin">
        <el-button type="info" @click="back">返回</el-button>
      </div>
    </div>
    <!-- 创建公告主内容 -->
    <div class="create-announcement-main">
      <el-form
        ref="form"
        :model="announcementInfo"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="公告标题" prop="title">
          <el-input
            class="announcement-title"
            v-model.trim="announcementInfo.title"
            show-word-limit
            maxlength="15"
          />
        </el-form-item>
        <el-form-item label="公告类型" prop="type">
          <announcement-select class="announcement-select" v-model="announcementInfo.type" />
        </el-form-item>
        <el-form-item label="公告简介" prop="brief">
          <el-input
            class="announcement-title"
            type="textarea"
            :rows="3"
            placeholder="请输入内容"
            maxlength="50"
            show-word-limit
            v-model="announcementInfo.brief"
          />
        </el-form-item>
        <el-form-item label="公告内容" prop="content">
          <markdown-editor v-model="announcementInfo.content" />
        </el-form-item>

        <el-form-item label="附加文件">
          <el-upload
            class="upload-file"
            multiple
            :action="updateDomain"
            :file-list="announcementInfo.files"
            :on-success="handleSuccess"
            :on-remove="onRemoveFile"
            :data="upyunConfig"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="通知对象" prop="receiverType">
          <announcement-people-select class="announcement-select" v-="announcementInfo.receiverType" />
        </el-form-item>

        <el-form-item label="通知时间" prop="sendType">
          <el-radio-group v-model="announcementInfo.sendType">
            <el-radio label="sendNow">立刻通知</el-radio>
            <el-radio label="settimeSend">
              <el-date-picker
                class="settime-box"
                value-format="yyyy-MM-dd HH:mm:ss"
                v-model="announcementInfo.sendAt"
                type="datetime"
                placeholder="选择日期时间"
              >
              </el-date-picker>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button @click="createAnnouncementInfo" type="primary">立即创建</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import AnnouncementSelect from '@/components/SelectBox/AnnouncementSelect'
import AnnouncementPeopleSelect from '@/components/SelectBox/AnnouncementPeopleSelect'
import MarkdownEditor from '@/components/MarkDownEditor'

import * as Commonality from '@/api/commonality'
import * as AnnouncementApi from '@/api/announcementApi'

import { mapGetters } from 'vuex'

export default {
  name: 'CreateAnnouncement',
  components: { AnnouncementSelect, MarkdownEditor, AnnouncementPeopleSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      rules: {
        title: [
          { required: true, message: '请输入公告标题', trigger: 'blur' },
          { min: 1, max: 15, message: '标题最长15个字符', trigger: 'blur' },
        ],
        type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
        brief: [
          { required: true, message: '请填写公告简介', trigger: 'blur' },
          { max: 50, message: '公告简介小于50个字符', trigger: 'blur' }
        ],
        content: [{ required: true, message: '请填写公告内容', trigger: 'change' }],
        receiverType: [{ required: true, message: '请选择通知对象', trigger: 'change' }],
        sendType: [{ required: true, message: '请选择通知时间', trigger: 'change' }]
      },
      announcementInfo: {
        title: '', // 公告标题
        type: '', // 公告类型
        brief: '', // 公告简介
        content: '', // 公告内容
        files: [], // 附带文件
        receiverType: '', // 通知人类型
        sendType: '', // 通知类型
        sendAt: null, // 通知时间
      },
      upyunConfig: {}
    }
  },
  computed: {
    ...mapGetters(['updateDomain', 'imgUploadDomain']),
  },
  created () {
    this.getUpyunSign()
  },
  methods: {
    /**
     * @description 创建公告
     */
    async createAnnouncementInfo () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await this.$refs['form'].validate()
        const req = {
          title: this.announcementInfo.title,
          type: this.announcementInfo.type,
          brief: this.announcementInfo.brief,
          content: this.announcementInfo.content,
          receiverType: this.announcementInfo.receiverType
        }
        if (this.announcementInfo.sendType === 'sendNow') {
          req.immediate = true
        }
        if (this.announcementInfo.sendType === 'settimeSend') {
          if (!this.announcementInfo.sendAt) throw new Error('请填写通知时间')
          req.sendAt = this.announcementInfo.sendAt
        }
        if (this.announcementInfo.files.length) {
          const files = this.announcementInfo.files.map(fileItem => {
            return {
              name: fileItem.name,
              path: `${this.imgUploadDomain}${fileItem.response.url}`
            }
          })
          req.files = files
        }
        await AnnouncementApi.createAnnouncementInfo(req)
        this.$refs['form'].resetFields()
        this.$emit('refresh')
      } catch (error) {
        if (typeof error === 'boolean') {
          this.$newMessage.warning('请检查表单')
        } else {
          this.$newMessage.warning(error.message || error)
        }
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 关闭组件
     */
    back () {
      this.$emit('close')
    },
    /**
     * @description 获取又拍云
     */
    async getUpyunSign () {
      this.upyunConfig = await Commonality.getFileSignature()
    },
    /**
     * @description 文件上传成功
     */
    handleSuccess (response, file, fileList) {
      this.announcementInfo.files = fileList
    },
    /**
     * @description 监听文件移除
     */
    onRemoveFile (file, fileList) {
      const { uid } = file
      const findIndex = this.announcementInfo.files.findIndex(item => item.uid === uid)
      if (findIndex >= 0) {
        this.announcementInfo.files.splice(findIndex, 1)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.create-announcement-main {
  .announcement-title {
    width: 320px;
  }

  .announcement-select {
    width: 320px;
  }

  .settime-box {
    width: 200px;
  }

  .upload-file {
    width: 400px;
  }

  .el-radio {
    margin-right: 14px;
  }
}
</style>
