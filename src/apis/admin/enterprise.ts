import axios from '@/utils/request.js'

export interface Enterprise {
  id: number
  cookie: string
  cid: string
  name: string
  bdstoken: string
  surl: string
  pwd?: string
  path: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GetEnterpriseParams {
  page: number
  size: number
  keyword?: string
  is_active?: boolean
  sort_field?: 'id' | 'cid' | 'created_at' | 'updated_at'
  sort_order?: 'asc' | 'desc'
}

export interface GetEnterpriseResponse {
  list: Enterprise[]
  pagination: {
    total: number
    current_page: number
    size: number
    last_page: number
  }
}

export interface CreateEnterpriseData {
  cookie: string
  cid: string
  name: string
  bdstoken: string
  surl: string
  pwd?: string
  path: string
  is_active?: boolean
}

// 获取企业账号列表
export const getEnterprises = (params: GetEnterpriseParams) => 
  axios.get<GetEnterpriseResponse>('/admin/enterprise', { params })

// 创建企业账号
export const createEnterprise = (data: CreateEnterpriseData) =>
  axios.post<{account: Enterprise}>('/admin/enterprise', data)

// 更新企业账号
export const updateEnterprise = (id: number, data: Partial<CreateEnterpriseData>) =>
  axios.patch<{account: Enterprise}>(`/admin/enterprise/${id}`, data)

// 删除企业账号
export const deleteEnterprise = (id: number) =>
  axios.delete<null>(`/admin/enterprise/${id}`)

// 批量删除企业账号
export const deleteEnterprises = (ids: number[]) =>
  axios.delete<null>('/admin/enterprise', { data: { ids } })

// 切换账号状态
export const toggleEnterpriseActive = (id: number) =>
  axios.patch<{account: Enterprise, status: string}>(`/admin/enterprise/${id}/toggle`)