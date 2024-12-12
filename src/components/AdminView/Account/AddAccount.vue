<template>
  <el-dialog title="添加账号" width="60%" v-model="isAddAccount" :before-close="close">
    <el-form
      ref="addAccountFormRef"
      :model="addAccountForm"
      :rules="addAccountFormRule"
      label-width="auto"
      v-loading="pending"
    >
      <el-form-item label="提示">
        <el-text>可以使用换行来分割多个账号</el-text>
      </el-form-item>
      <el-form-item label="账号类型">
        <el-select v-model="addAccountForm.type">
          <el-option label="cookie" :value="1"> </el-option>
          <el-option label="token" :value="2"> </el-option>
          <el-option label="enterprise" :value="3"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Cookie" prop="cookie" v-if="addAccountForm.type === 1 || addAccountForm.type === 3">
        <el-input type="textarea" v-model="addAccountForm.cookie"></el-input>
      </el-form-item>
      <el-form-item label="refresh_token" prop="cookie" v-else>
        <el-input type="textarea" v-model="addAccountForm.cookie"></el-input>
      </el-form-item>
      <el-form-item 
        label="关联企业账号" 
        prop="enterprise_account_id"
      >
        <el-select 
          v-model="addAccountForm.enterprise_account_id"
          clearable
          placeholder="选择企业账号"
        >
          <el-option 
            v-for="item in enterpriseList" 
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="info" @click="cancel()">取消</el-button>
      <el-button type="primary" @click="addAccount(addAccountFormRef)">添加</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import * as AccountApi from '@/apis/admin/account.js'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ref, onMounted } from 'vue'
import * as EnterpriseApi from '@/apis/admin/enterprise'

const emit = defineEmits(['getAccounts'])
const isAddAccount = defineModel()

const pending = ref(false)

const addAccountForm = ref<AccountApi.addAccount>({
  type: 1,
  cookie: '',
  enterprise_account_id: null
})
const addAccountFormRef = ref<FormInstance | null>(null)
const addAccountFormRule: FormRules = {
  cookie: [{ required: true, message: '请输入账户信息', trigger: 'blur' }],
  enterprise_account_id: [{ required: false, message: '请选择关联的企业账号', trigger: 'change' }]
}

const enterpriseList = ref<EnterpriseApi.Enterprise[]>([])

const getEnterpriseList = async () => {
  try {
    const res = await EnterpriseApi.getEnterprises({
      page: 1,
      size: 100,
      is_active: true
    })
    enterpriseList.value = res.data.list
  } catch (error) {
    console.error('获取企业账号列表失败:', error)
  }
}

onMounted(() => {
  getEnterpriseList()
})

const addAccount = async (formEl: FormInstance | null) => {
  if (!formEl || !(await formEl.validate())) return

  try {
    pending.value = true
    const res = await AccountApi.addAccount(addAccountForm.value)
    if (res.data.have_repeat) ElMessage.info('存在重复的账号,已自动过滤')
    ElMessage.success('添加成功')
  } finally {
    pending.value = false
  }
}

const close = (done: (cancel?: boolean) => {}) => {
  emit('getAccounts')
  done()
}

const cancel = () => {
  isAddAccount.value = false
  emit('getAccounts')
}
</script>

<style lang="scss" scoped></style>
