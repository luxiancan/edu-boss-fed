<template>
  <div class="login">
    <div class="tips">欢迎进入卢显灿构建的后台管理系统~</div>
    <el-form class="login-form" label-position="top" ref="form"
      :model="form" label-width="80px" :rules="rules">
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="form.password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="login-btn" type="primary" @click="onSubmit" :loading="isLoginLoading">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { login } from '@/services/user.ts'
import { Form } from 'element-ui'

export default Vue.extend({
  name: 'LoginIndex',
  data () {
    return {
      form: {
        phone: '15510792995',
        password: '111111'
      },
      rules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ]
      },
      isLoginLoading: false
    }
  },
  methods: {
    async onSubmit () {
      try {
        await (this.$refs.form as Form).validate()
        this.isLoginLoading = true
        const { data } = await login(this.form)
        if (data.state !== 1) {
          this.$message.error(data.message)
        } else {
          this.$store.commit('setUser', data.content)
          this.$router.push(this.$route.query.redirect as string || '/')
          this.$message.success('登录成功')
        }
      } catch (err) {
        console.log('登录失败', err)
      }
      this.isLoginLoading = false
    }
  }
})
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .tips {
    margin-bottom: 16px;
    font-size: 16px;
    color: #666;
  }
  .login-form {
    width: 300px;
    background: #fff;
    padding: 20px 26px;
    border-radius: 5px;
  }
  .login-btn {
    width: 100%;
  }
}
</style>
