import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiEnvelope, PageResult } from '@/types/api'
import { clearSession, readToken, readTokenType } from '@/utils/storage'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/admin'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  const token = readToken()
  if (token) {
    config.headers.Authorization = `${readTokenType()} ${token}`
  }
  return config
})

function responseMessage(data: unknown) {
  if (!data || typeof data !== 'object') return ''
  const payload = data as { message?: unknown; error?: unknown }
  if (typeof payload.message === 'string' && payload.message) return payload.message
  if (typeof payload.error === 'string' && payload.error) return payload.error
  return ''
}

export function getRequestErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || /timeout/i.test(error.message)) {
      return '请求超时，请稍后查看结果或重试'
    }
    return responseMessage(error.response?.data) || error.message || '请求失败'
  }

  if (error instanceof Error) return error.message || '请求失败'
  return '请求失败'
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    const message = getRequestErrorMessage(error)

    if (status === 401) {
      clearSession()
      if (!window.location.pathname.includes('/login')) {
        window.location.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      }
    }

    ElMessage.error(message)
    return Promise.reject(error)
  },
)

export async function requestData<T>(config: AxiosRequestConfig) {
  const response = await http.request<ApiEnvelope<T>>(config)
  return response.data.data
}

export function normalizePage<T>(data: PageResult<T> | T[]): PageResult<T> {
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      page_size: data.length,
    }
  }
  return {
    items: data.items || [],
    total: Number(data.total || 0),
    page: Number(data.page || 1),
    page_size: Number(data.page_size || 20),
  }
}
