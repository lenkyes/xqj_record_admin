import { onMounted, reactive, ref } from 'vue'
import type { PageQuery, PageResult } from '@/types/api'

type Loader<T> = (query: PageQuery) => Promise<PageResult<T>>

export function usePagedList<T, F extends Record<string, unknown> = Record<string, unknown>>(
  loader: Loader<T>,
  initialFilters = {} as F,
) {
  const loading = ref(false)
  const items = ref<T[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const filters = reactive({ ...initialFilters }) as F

  async function load() {
    loading.value = true
    try {
      const result = await loader({
        page: page.value,
        page_size: pageSize.value,
        ...filters,
      })
      items.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.page_size
    } finally {
      loading.value = false
    }
  }

  function search() {
    page.value = 1
    load()
  }

  function reset() {
    Object.keys(filters).forEach((key) => {
      filters[key as keyof F] = '' as F[keyof F]
    })
    search()
  }

  function onSizeChange(size: number) {
    pageSize.value = size
    search()
  }

  function onPageChange(current: number) {
    page.value = current
    load()
  }

  onMounted(load)

  return {
    loading,
    items,
    total,
    page,
    pageSize,
    filters,
    load,
    search,
    reset,
    onSizeChange,
    onPageChange,
  }
}
