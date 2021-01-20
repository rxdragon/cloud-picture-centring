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
      <el-form ref="form" :model="announcementInfo" label-width="80px">
        <el-form-item label="公告标题">
          <el-input v-model="announcementInfo.title"></el-input>
        </el-form-item>
        <el-form-item label="公告类型">
          <announcement-select v-model="announcementInfo.type" />
        </el-form-item>
        <el-form-item label="公告简介">
          <el-input
            type="textarea"
            :rows="3"
            placeholder="请输入内容"
            maxlength="50"
            show-word-limit
            v-model="announcementInfo.brief"
          />
        </el-form-item>
        <el-form-item label="公告内容">
          <markdown-editor v-model="announcementInfo.content" />
        </el-form-item>

        <el-form-item label="附加文件">
          <el-upload
            class="upload-file"
            multiple
            :action="updateDomain"
            :file-list="announcementInfo.files"
            :on-success="handleSuccess"
            :data="upyunConfig"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="通知对象">
          <announcement-people-select v-model="announcementInfo.receiver_type" />
        </el-form-item>

        <el-form-item label="通知时间">
          <el-radio-group v-model="announcementInfo.sendType">
            <el-radio label="立刻通知" value="sendNow"></el-radio>
            <el-radio value="settimeSend">
              <el-date-picker v-model="announcementInfo.sendAt" type="datetime" placeholder="选择日期时间"></el-date-picker>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary">立即创建</el-button>
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

import { mapGetters } from 'vuex'

export default {
  name: 'CreateAnnouncement',
  components: { AnnouncementSelect, MarkdownEditor, AnnouncementPeopleSelect },
  data () {
    return {
      announcementInfo: {
        title: '', // 公告标题
        type: '', // 公告类型
        brief: '', // 公告简介
        content: '', // 公告内容
        files: [], // 附带文件
        receiver_type: '', // 通知人类型
        sendType: '', // 通知类型
        sendAt: null, // 通知时间
      },
      upyunConfig: {}
    }
  },
  computed: {
    ...mapGetters(['updateDomain']),
  },
  created () {
    this.getUpyunSign()
  },
  methods: {
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
    }
  }
}
</script>
