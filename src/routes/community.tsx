import { createFileRoute } from '@tanstack/react-router';
import CommunityPage from '../page/CommunityPage';

export const Route = createFileRoute('/community')({
  component: CommunityPage,
});
