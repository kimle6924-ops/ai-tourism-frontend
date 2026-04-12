import { createFileRoute } from '@tanstack/react-router';
import RankPage from '../page/RankPage';

export const Route = createFileRoute('/ranks')({
  component: RankPage,
});
