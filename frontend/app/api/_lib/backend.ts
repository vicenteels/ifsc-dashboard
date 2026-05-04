import { NextResponse } from 'next/server'

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '')
}

export function getBackendBaseUrl(): string {
  const baseUrl =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ''

  if (!baseUrl) {
    throw new Error(
      'Backend base URL not configured. Set API_URL (recommended) or NEXT_PUBLIC_API_URL.'
    )
  }

  return normalizeBaseUrl(baseUrl)
}

export async function proxyJson(
  targetUrl: string,
  init: RequestInit & { forwardHeaders?: Headers }
) {
  const { forwardHeaders, ...fetchInit } = init

  const headers = new Headers(fetchInit.headers)

  if (forwardHeaders) {
    const requestId = forwardHeaders.get('x-request-id')
    if (requestId && !headers.has('x-request-id')) headers.set('x-request-id', requestId)
  }

  const res = await fetch(targetUrl, { ...fetchInit, headers })
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '')

  return NextResponse.json(body, { status: res.status })
}

