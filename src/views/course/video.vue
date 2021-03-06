<template>
  <div class="container">
    <el-card>
      <div slot="header">
        <div>课程：</div>
        <div>阶段：</div>
        <div>课时：</div>
      </div>
      <el-form label-width="40px">
        <el-form-item label="视频">
          <input
            ref="video-file"
            type="file"
          >
        </el-form-item>
        <el-form-item label="封面">
          <input
            ref="image-file"
            type="file"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleUpload"
          >开始上传</el-button>
          <el-button @click="$router.back()">返回</el-button>
        </el-form-item>
        <el-form-item>
          <p>视频上传中：{{ uploadPercent }}%</p>
          <p v-if="isUploadSuccess">视频转码中：{{ isTransCodeSuccess ? '完成' : '正在处理，请稍后' }}</p>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
/* eslint-disable */
import Vue from 'vue'
import {
  aliyunImagUploadAddressAdnAuth,
  aliyunVideoUploadAddressAdnAuth,
  transCodeVideo,
  getAliyunTransCodePercent
} from '@/services/aliyun-oss'

export default Vue.extend({
  name: 'CourseVideo',
  data () {
    return {
      uploader: null,
      imageUrl: '',
      videoId: null,
      fileName: '',
      uploadPercent: 0,
      isUploadSuccess: false,
      isTransCodeSuccess: false
    }
  },
  computed: {
    video () {
      return this.$refs['video-file']
    },
    image () {
      return this.$refs['image-file']
    }
  },
  created () {
    this.initUploader()
  },
  methods: {
    initUploader () {
      this.uploader = new window.AliyunUpload.Vod({
        // 阿里账号ID，必须有值 ，值的来源https://help.aliyun.com/knowledge_detail/37196.html
        userId: 1618139964448548,
        // 上传到点播的地域， 默认值为'cn-shanghai',//eu-central-1,ap-southeast-1
        region: 'cn-shanghai',
        // 分片大小默认1M，不能小于100K
        partSize: 1048576,
        // 并行上传分片个数，默认5
        parallel: 5,
        // 网络原因失败时，重新上传次数，默认为3
        retryCount: 3,
        // 网络原因失败时，重新上传间隔时间，默认为2秒
        retryDuration: 2,
        // 开始上传
        onUploadstarted: async uploadInfo => {
          console.log('onUploadstarted', uploadInfo)

          // 1. 通过我们的后端获取文件上传凭证
          let uploadAuthInfo = null
          if (uploadInfo.isImage) {
            const { data } = await aliyunImagUploadAddressAdnAuth()
            uploadAuthInfo = data.data
            this.imageUrl = data.data.imageURL
          } else {
            const { data } = await aliyunVideoUploadAddressAdnAuth({
              fileName: uploadInfo.file.name,
              imageUrl: this.imageURL // 请确保一定是先上传图片
            })
            uploadAuthInfo = data.data
            this.videoId = data.data.videoId
          }
          
          // console.log('uploadAuthInfo', uploadAuthInfo)

          this.uploader.setUploadAuthAndAddress(
            uploadInfo,
            uploadAuthInfo.uploadAuth,
            uploadAuthInfo.uploadAddress,
            uploadAuthInfo.imageId || uploadAuthInfo.videoId
          )
        },
        // 文件上传成功
        onUploadSucceed: (uploadInfo) => {
          console.log('onUploadSucceed', uploadInfo)
        },
        // 文件上传失败
        onUploadFailed: (uploadInfo, code, message) => {
          console.log('onUploadFailed', code, message)
        },
        // 文件上传进度，单位：字节
        onUploadProgress: (uploadInfo, totalSize, loadedPercent) => {
          if (!uploadInfo.isImage) {
            this.uploadPercent = Math.floor(loadedPercent * 100)
          }
        },
        // 上传凭证超时
        onUploadTokenExpired: (uploadInfo) => {
          console.log('onUploadTokenExpired')
        },
        // 全部文件上传结束
        onUploadEnd: async uploadInfo => {
          this.isUploadSuccess = true
          // 请求转码
          const { data } = await transCodeVideo({
            lessonId: this.$route.query.lessonId,
            coverImageUrl: this.imageUrl,
            fileName: this.fileName,
            fileId: this.videoId
          })
          console.log(data)

          const timer = setInterval(async () => {
             const { data } = await getAliyunTransCodePercent(this.$route.query.lessonId)
             console.log('转码进度', data.data)
             if (data.data === 100) {
               this.isTransCodeSuccess = true
               window.clearInterval(timer)
               console.log('转码成功');
             }
          }, 3000)
        }
      })
    },

    handleUpload () {
      // 初始化上传状态
      this.isUploadSuccess = false
      this.isTransCodeSuccess = false
      this.uploadPercent = 0

      // 获取上传的文件
      const videoFile = this.video.files[0]
      const imageFile = this.image.files[0]
      const uploader = this.uploader

      // 将用户所选的文件添加到上传列表中
      // 一旦开始上传，它就会按照列表中添加的顺序开始上传
      uploader.addFile(imageFile, null, null, null, '{"Vod":{}}')
      uploader.addFile(videoFile, null, null, null, '{"Vod":{}}')

      this.fileName = videoFile.name

      // 开始上传，触发 onUploadstarted
      uploader.startUpload()
    }
  }
})
</script>
