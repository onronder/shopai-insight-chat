import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { bootstrapAuthFromToken } from '@/lib/initAuth'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token')

    if (token) {
      bootstrapAuthFromToken(token).then(() => {
        url.searchParams.delete('token')
        window.history.replaceState({}, '', url.pathname)
        router.push('/dashboard')
      })
    }
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <h1>Redirecting to dashboard...</h1>
    </div>
  )
}
