// TS 默认无法识别 .vue 结尾的文件
// 这里做了适配，让TS能够识别 .vue 文件，类型识别为 Vue 构造函数
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

// interface Window {
//   AliyunUpload: any
// }
