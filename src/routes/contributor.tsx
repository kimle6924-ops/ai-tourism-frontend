import { createFileRoute } from '@tanstack/react-router'
import { ContributorPage } from '../page/ContributorPage'
import { parseManagementSearch, type ManagementSearch } from '../utils/managementSearch'

export const Route = createFileRoute('/contributor')({
  validateSearch: (search: Record<string, unknown>): ManagementSearch =>
    parseManagementSearch(search, 'overview'),
  component: ContributorPage,
})
