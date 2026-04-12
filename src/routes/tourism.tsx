import { createFileRoute } from '@tanstack/react-router';
import TourismPage from '../page/TourismPage';

export const Route = createFileRoute('/tourism')({
  component: TourismPage,
});
