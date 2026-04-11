import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Provider } from 'react-redux'
import { routeTree } from './routeTree.gen'
import { store } from './store'
import { logout } from './store/slice/LoginSlice'
import { resetProfile } from './store/slice/ProfileSlice'
import { clearChatbot } from './store/slice/ChatbotGeminiSlice'
import { AUTH_CLEARED_EVENT } from './utils/headerApi'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (typeof window !== 'undefined') {
  const windowWithFlag = window as Window & { __authClearedListenerAttached?: boolean }
  if (!windowWithFlag.__authClearedListenerAttached) {
    window.addEventListener(AUTH_CLEARED_EVENT, () => {
      store.dispatch(logout())
      store.dispatch(resetProfile())
      store.dispatch(clearChatbot())
    })
    windowWithFlag.__authClearedListenerAttached = true
  }
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
}
