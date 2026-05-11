'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const token = window.localStorage.getItem('moodle_token')
    router.replace(token ? '/dashboard' : '/login')
  }, [router])

  return null
}

