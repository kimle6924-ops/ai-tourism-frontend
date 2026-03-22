import { createFileRoute } from '@tanstack/react-router'
import { AdminPage } from '../page/AdminPage'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})
