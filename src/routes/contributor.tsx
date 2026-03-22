import { createFileRoute } from '@tanstack/react-router'
import { ContributorPage } from '../page/ContributorPage'

export const Route = createFileRoute('/contributor')({
  component: ContributorPage,
})
