import axios from '@/utils/request.js'

export interface addGroup {
  name: string
  size: number
  count: number
}

export const addGroup = (data: addGroup) => axios.post<null>('/admin/group', data)

export interface Group {
  id: number
  name: string
  size: number
  count: number
  created_at: string
  updated_at: string
  deleted_at: string
}

export interface getGroup {
  current_page: number
  data: Group[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  next_page_url: string
  path: string
  per_page: number
  prev_page_url: string
  to: number
  total: number
}

export const getGroup = (data: { page: number; size: number }) =>
  axios.get<getGroup>(`/admin/group?page=${data.page}&size=${data.size}`)

export const updateGroup = (group: Group) => axios.patch<null>(`/admin/group/${group.id}`, group)

export const deleteGroup = (group: Group) =>
  axios.delete<null>(`/admin/group`, { data: { group_ids: [group.id] } })

export const deleteGroups = (group_ids: number[]) =>
  axios.delete<null>('/admin/group', { data: { group_ids } })
