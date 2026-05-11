import { getBackendBaseUrl, proxyJson } from '../../../_lib/backend'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const baseUrl = getBackendBaseUrl()
    const url = new URL(req.url)
    const target = new URL(`${baseUrl}/moodle/demo/questionarios`)
    target.search = url.search

    return proxyJson(target.toString(), {
      method: 'GET',
      forwardHeaders: new Headers(req.headers),
    })
  } catch (error) {
    console.error('[api/moodle/demo/questionarios] Proxy error:', error)
    return NextResponse.json({ error: 'Erro ao conectar ao servidor.' }, { status: 502 })
  }
}

