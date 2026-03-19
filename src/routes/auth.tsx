import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '../page/AuthPage'

export const Route = createFileRoute('/auth')({ component: AuthPage })
