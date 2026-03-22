import { createFileRoute } from '@tanstack/react-router'
import { AdministrativeUnitsPage } from '../page/AdministrativeUnitsPage'

export const Route = createFileRoute('/administrative-units')({
  component: AdministrativeUnitsPage,
})
