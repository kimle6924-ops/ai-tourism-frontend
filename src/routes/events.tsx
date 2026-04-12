import { createFileRoute } from '@tanstack/react-router';
import EventPage from '../page/EventPage';

export const Route = createFileRoute('/events')({
  component: EventPage,
});
