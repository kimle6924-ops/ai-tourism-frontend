import { createFileRoute } from '@tanstack/react-router';
import ProfilePage from '../page/ProfilePage';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});
