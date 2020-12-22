<template>
  <div>
    <el-form label-position="right" label-width="80px" style="width: 80%;margin: 0 auto;">
      <el-form-item label="资源名称">
        <el-input v-model="resourceForm.name"></el-input>
      </el-form-item>
      <el-form-item label="资源路径">
        <el-input v-model="resourceForm.url"></el-input>
      </el-form-item>
      <el-form-item label="资源分类">
        <el-select
          v-model="resourceForm.categoryId"
          placeholder="请选择资源分类"
          clearable
        >
          <el-option
            v-for="item in resourceCategories"
            :label="item.name"
            :value="item.id"
            :key="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input type="textarea" v-model="resourceForm.description"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { getResourceCategories } from '@/services/resource-category'
import { createOrUpdate, getResourceById } from '@/services/resource'

export default Vue.extend({
  name: 'CreateOrEditResource',
  props: {
    resourceId: {
      type: [String, Number]
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      resourceCategories: [],
      resourceForm: {
        name: '',
        url: '',
        categoryId: 1,
        description: ''
      }
    }
  },

  created () {
    this.loadResourceCategories()
    // 如果是编辑操作，则根据资源 ID 加载展示资源信息
    if (this.isEdit) {
      this.loadResource()
    }
  },

  methods: {
    async loadResourceCategories () {
      const { data } = await getResourceCategories()
      this.resourceCategories = data.data
    },

    async loadResource () {
      const { data } = await getResourceById(this.resourceId)
      this.resourceForm = data.data
    },

    async onSubmit () {
      await createOrUpdate(this.resourceForm)
      this.$message.success('操作成功')
      this.$emit('success')
    }
  }
})
</script>

<style lang="scss" scoped></style>
