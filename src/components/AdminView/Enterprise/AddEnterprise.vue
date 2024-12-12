<template>
  <el-dialog
    :title="editingEnterprise ? '编辑企业账号' : '添加企业账号'"
    width="60%"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      v-loading="pending"
    >
      <el-form-item label="企业CID" prop="cid">
        <el-input v-model="form.cid" placeholder="请输入企业CID" />
      </el-form-item>
      
      <el-form-item label="企业名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入企业名称" />
      </el-form-item>
      
      <el-form-item label="Cookie" prop="cookie">
        <el-input
          v-model="form.cookie"
          type="textarea"
          :rows="3"
          placeholder="请输入Cookie"
        />
      </el-form-item>
      
      <el-form-item label="安全令牌" prop="bdstoken">
        <el-input v-model="form.bdstoken" placeholder="请输入bdstoken" />
      </el-form-item>
      
      <el-form-item label="分享链接" prop="surl">
        <el-input v-model="form.surl" placeholder="请输入分享链接" />
      </el-form-item>
      
      <el-form-item label="提取密码" prop="pwd">
        <el-input v-model="form.pwd" placeholder="请输入提取密码(可选)" />
      </el-form-item>
      
      <el-form-item label="存储路径" prop="path">
        <el-input v-model="form.path" placeholder="请输入存储路径">
        </el-input>
      </el-form-item>
      
      <el-form-item label="状态" prop="is_active">
        <el-switch v-model="form.is_active" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit(formRef)">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import * as EnterpriseApi from '@/apis/admin/enterprise'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'getEnterprises'])

// 表单相关
const formRef = ref<FormInstance>()
const pending = ref(false)
const editingEnterprise = ref<EnterpriseApi.Enterprise | null>(null)

const form = ref<EnterpriseApi.CreateEnterpriseData>({
  cid: '',
  name: '',
  cookie: '',
  bdstoken: '',
  surl: '',
  pwd: '',
  path: '',
  is_active: true
})

const rules: FormRules = {
  cid: [{ required: true, message: '请输入企业CID', trigger: 'blur' }],
  name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  cookie: [{ required: true, message: '请输入Cookie', trigger: 'blur' }],
  bdstoken: [{ required: true, message: '请输入安全令牌', trigger: 'blur' }],
  surl: [{ required: true, message: '请输入分享链接', trigger: 'blur' }],
  path: [{ required: true, message: '请输入存储路径', trigger: 'blur' }]
}

// 监听modelValue变化，重置表单
watch(() => props.modelValue, (val) => {
  if (!val) {
    resetForm()
  }
})

// 设置编辑数据
const setEditingEnterprise = (enterprise: EnterpriseApi.Enterprise) => {
  editingEnterprise.value = enterprise
  form.value = {
    cid: enterprise.cid,
    name: enterprise.name,
    cookie: enterprise.cookie,
    bdstoken: enterprise.bdstoken,
    surl: enterprise.surl,
    pwd: enterprise.pwd || '',
    path: enterprise.path,
    is_active: enterprise.is_active
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  editingEnterprise.value = null
  form.value = {
    cid: '',
    name: '',
    cookie: '',
    bdstoken: '',
    surl: '',
    pwd: '',
    path: '',
    is_active: true
  }
}

// 处理关闭
const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}

// 处理提交
const handleSubmit = async (formEl: FormInstance | null | undefined) => {
  if (!formEl) return
  
  try {
    await formEl.validate()
    
    pending.value = true
    if (editingEnterprise.value) {
      await EnterpriseApi.updateEnterprise(editingEnterprise.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await EnterpriseApi.createEnterprise(form.value)
      ElMessage.success('添加成功')
    }
    
    emit('getEnterprises')
    emit('update:modelValue', false)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(editingEnterprise.value ? '更新失败' : '添加失败')
    }
  } finally {
    pending.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  setEditingEnterprise
})
</script> 