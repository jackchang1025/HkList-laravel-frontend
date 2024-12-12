<template>
  <AddEnterprise @getEnterprises="getEnterprises" v-model="isAddEnterprise" ref="addEnterpriseRef" />

  <div class="toolbar">
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="关键词">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索名称/CID/短链/路径"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.is_active" clearable placeholder="全部" style="width: 100px">
          <el-option label="激活" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <div class="action-buttons">
      <el-button type="primary" @click="getEnterprises()">刷新列表</el-button>
      <el-button type="primary" @click="switchAddEnterprise()">添加账号</el-button>
      <el-button 
        type="danger" 
        :disabled="selectEnterprises.length <= 0" 
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
    </div>
  </div>

  <el-table
    v-loading="pending"
    :data="enterpriseList"
    border
    show-overflow-tooltip
    class="table"
    @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="40" />
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="name" label="企业名称" min-width="120" />
    <el-table-column prop="cid" label="企业CID" min-width="120" />
    <el-table-column prop="surl" label="分享链接" min-width="120" show-overflow-tooltip />
    <el-table-column prop="path" label="存储路径" min-width="120" show-overflow-tooltip />
    <el-table-column prop="is_active" label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="row.is_active ? 'success' : 'danger'">
          {{ row.is_active ? '已激活' : '已停用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="created_at" label="创建时间" width="180">
      <template #default="{ row }">
        {{ new Date(row.created_at).toLocaleString() }}
      </template>
    </el-table-column>
    <el-table-column width="250" label="操作" fixed="right">
      <template #default="{ row }">
        <el-button 
          size="small" 
          :type="row.is_active ? 'warning' : 'success'"
          @click="handleToggleActive(row)"
        >
          {{ row.is_active ? '停用' : '激活' }}
        </el-button>
        <el-button 
          size="small" 
          type="primary" 
          @click="handleEdit(row)"
        >
          编辑
        </el-button>
        <el-button 
          size="small" 
          type="danger" 
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :page-sizes="[15, 50, 100]"
    :total="total"
    layout="total, sizes, prev, pager, next, jumper"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as EnterpriseApi from '@/apis/admin/enterprise'
import AddEnterprise from './AddEnterprise.vue'

const pending = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)
const enterpriseList = ref<EnterpriseApi.Enterprise[]>([])
const selectEnterprises = ref<EnterpriseApi.Enterprise[]>([])
const isAddEnterprise = ref(false)

const searchForm = ref({
  keyword: '',
  is_active: undefined as boolean | undefined,
})

const addEnterpriseRef = ref<InstanceType<typeof AddEnterprise> | null>(null)

// 获取企业账号列表
const getEnterprises = async () => {
  try {
    pending.value = true
    const res = await EnterpriseApi.getEnterprises({
      page: currentPage.value,
      size: pageSize.value,
      ...searchForm.value
    })
    enterpriseList.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    pending.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getEnterprises()
}

// 处理分页变化
const handleSizeChange = () => getEnterprises()
const handleCurrentChange = () => getEnterprises()

// 处理选择变化
const handleSelectionChange = (rows: EnterpriseApi.Enterprise[]) => {
  selectEnterprises.value = rows
}

// 切换添加对话框
const switchAddEnterprise = () => {
  isAddEnterprise.value = !isAddEnterprise.value
}

// 处理删除
const handleDelete = async (row: EnterpriseApi.Enterprise) => {
  try {
    await ElMessageBox.confirm('确定要删除该企业账号吗？', '提示', {
      type: 'warning'
    })
    
    pending.value = true
    await EnterpriseApi.deleteEnterprise(row.id)
    ElMessage.success('删除成功')
    getEnterprises()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    pending.value = false
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectEnterprises.value.length} 个企业账号吗？`, 
      '提示',
      { type: 'warning' }
    )
    
    pending.value = true
    await EnterpriseApi.deleteEnterprises(selectEnterprises.value.map(item => item.id))
    ElMessage.success('批量删除成功')
    getEnterprises()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  } finally {
    pending.value = false
  }
}

// 处理切换状态
const handleToggleActive = async (row: EnterpriseApi.Enterprise) => {
  try {
    pending.value = true
    const res = await EnterpriseApi.toggleEnterpriseActive(row.id)
    ElMessage.success(res.data.status)
    getEnterprises()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    pending.value = false
  }
}

// 处理编辑
const handleEdit = (row: EnterpriseApi.Enterprise) => {
  addEnterpriseRef.value?.setEditingEnterprise(row)
  isAddEnterprise.value = true
}

onMounted(getEnterprises)
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.table {
  margin-bottom: 15px;
}
</style> 