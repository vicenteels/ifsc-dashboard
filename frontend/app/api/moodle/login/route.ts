import { getBackendBaseUrl, proxyJson } from '../../_lib/backend'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const baseUrl = getBackendBaseUrl()
    const body = await req.json().catch(() => ({}))

    return proxyJson(`${baseUrl}/moodle/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      forwardHeaders: new Headers(req.headers),
    })
  } catch (error) {
    console.error('[api/moodle/login] Proxy error:', error)
    return NextResponse.json({ error: 'Erro ao conectar ao servidor.' }, { status: 502 })
  }
}
