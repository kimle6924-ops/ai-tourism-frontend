import { createFileRoute } from '@tanstack/react-router'
import { LocationDetailPage } from '../page/LocationDetailPage'

export const Route = createFileRoute('/places/$id')({
  validateSearch: (search: Record<string, unknown>): { resourceType: number } => {
    return {
      resourceType: Number(search?.resourceType ?? 0),
    }
  },
  component: () => <RouteComponent />
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { resourceType } = Route.useSearch()
  const type = resourceType === 1 ? 'events' : 'places'
  return <LocationDetailPage type={type} id={id} resourceType={resourceType} />
}
