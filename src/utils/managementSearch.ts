export type ManagementTab =
  | 'overview'
  | 'users'
  | 'places'
  | 'events'
  | 'moderation'
  | 'categories'
  | 'reviews'

export interface ManagementSearch {
  tab: ManagementTab
  provinceId: string
  wardId: string
  q: string
  page: number
}

export const parseManagementSearch = (
  search: Record<string, unknown>,
  fallbackTab: ManagementTab,
): ManagementSearch => {
  const rawTab = typeof search.tab === 'string' ? search.tab : fallbackTab
  const pageValue = Number(search.page ?? 1)

  return {
    tab: isManagementTab(rawTab) ? rawTab : fallbackTab,
    provinceId: typeof search.provinceId === 'string' ? search.provinceId : '',
    wardId: typeof search.wardId === 'string' ? search.wardId : '',
    q: typeof search.q === 'string' ? search.q : '',
    page: Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 1,
  }
}

const isManagementTab = (value: string): value is ManagementTab => {
  return ['overview', 'users', 'places', 'events', 'moderation', 'categories', 'reviews'].includes(value)
}
