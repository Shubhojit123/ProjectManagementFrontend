import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from '../ContextApi/AppContext.jsx'
import {AdminProvider} from '../AdminComponent/AdminContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AdminProvider>
          <App />
        </AdminProvider>
      </AppProvider>
    </QueryClientProvider>
  </StrictMode>
)
