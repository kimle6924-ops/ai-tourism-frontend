import { createFileRoute } from '@tanstack/react-router'
import { AdminPage } from '../page/AdminPage'
import { parseManagementSearch, type ManagementSearch } from '../utils/managementSearch'

export const Route = createFileRoute('/admin')({
  validateSearch: (search: Record<string, unknown>): ManagementSearch =>
    parseManagementSearch(search, 'overview'),
  component: AdminPage,
})
