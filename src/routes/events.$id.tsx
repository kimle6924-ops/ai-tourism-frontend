import { createFileRoute } from '@tanstack/react-router'
import { LocationDetailPage } from '../page/LocationDetailPage'

export const Route = createFileRoute('/events/$id')({
  validateSearch: (search: Record<string, unknown>): { resourceType: number } => {
    return {
      resourceType: Number(search?.resourceType ?? 1),
    }
  },
  component: () => <RouteComponent />
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { resourceType } = Route.useSearch()
  return <LocationDetailPage type="events" id={id} resourceType={resourceType} />
}
