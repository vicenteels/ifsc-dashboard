import { getBackendBaseUrl, proxyJson } from '../../_lib/backend'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const baseUrl = getBackendBaseUrl()

    return proxyJson(`${baseUrl}/moodle/demo-login`, {
      method: 'POST',
      forwardHeaders: new Headers(req.headers),
    })
  } catch (error) {
    console.error('[api/moodle/demo-login] Proxy error:', error)
    return NextResponse.json({ error: 'Erro ao conectar ao servidor.' }, { status: 502 })
  }
}

