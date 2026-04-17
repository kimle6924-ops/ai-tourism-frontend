import { Outlet, createRootRoute, useNavigate, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'

import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const user = useSelector((state: RootState) => state.login.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const role = user.role;
      const path = location.pathname;

      // Allow all roles to access /profile
      if (path.startsWith('/profile')) return;

      if (role === 0 && !path.startsWith('/admin')) {
        navigate({ to: '/admin' });
      } else if (role === 1 && !path.startsWith('/contributor')) {
        navigate({ to: '/contributor' });
      } else if (role === 2 && path === '/auth') {
        navigate({ to: '/' });
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <>
      <Outlet />
    </>
  )
}
