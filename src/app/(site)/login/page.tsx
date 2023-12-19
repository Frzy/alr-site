import LoginView from '@/components/Views/LoginView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ALR 91: Portal Login',
  description: 'American Legion Riders Chapter 91 Portal Login',
}

export default function LoginPage(): React.ReactNode {
  return <LoginView />
}
