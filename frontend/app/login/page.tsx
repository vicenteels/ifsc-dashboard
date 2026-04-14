'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!username || !password) {
      setErro('Preencha o usuário e a senha.')
      return
    }

    setCarregando(true)
    setErro('')

    try {
      const resposta = await fetch('http://localhost:3000/moodle/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const dados = await resposta.json()

      if (!resposta.ok || !dados.token) {
        setErro('Usuário ou senha incorretos.')
        return
      }

      localStorage.setItem('moodle_token', dados.token)
      router.push('/dashboard')

    } catch {
      setErro('Erro ao conectar com o servidor.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0f1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        background: '#1a1d27',
        borderRadius: '16px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '380px',
        border: '0.5px solid #2a2d3a',
      }}>

        {/* Logo IFSC */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          {/* Grade de quadrados do logo IFSC */}
          <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px' }}>
              {/* Linha 1 */}
              <div style={{ width: '12px', height: '12px', background: '#transparent'}} />
              <div style={{ width: '12px', height: '12px', background: '#cc2222', borderRadius: '50%' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              {/* Linha 2 */}
              <div style={{ width: '12px', height: '12px', background: '#transparent'}} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#transparent'}} />
              {/* Linha 3 */}
              <div style={{ width: '12px', height: '12px', background: '#transparent' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              {/* Linha 4 */}
              <div style={{ width: '12px', height: '12px', background: '#transparent' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#transparent'}} />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 500, color: '#e2e2e2', letterSpacing: '0.08em' }}>
              INSTITUTO FEDERAL
            </div>
            <div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.05em' }}>
              Santa Catarina
            </div>
          </div>

          <div style={{ marginTop: '16px', width: '100%', borderTop: '0.5px solid #2a2d3a', paddingTop: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#888' }}>Acesse com suas credenciais do Moodle</div>
          </div>
        </div>

        {/* Campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seu.usuario"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%',
                background: '#0f1117',
                border: '0.5px solid #2a2d3a',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#e2e2e2',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%',
                background: '#0f1117',
                border: '0.5px solid #2a2d3a',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#e2e2e2',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {erro && (
            <p style={{ fontSize: '12px', color: '#E24B4A', margin: 0 }}>{erro}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={carregando}
            style={{
              marginTop: '4px',
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              background: carregando ? '#1f4d1f' : '#2d7a2d',
              color: carregando ? '#888' : '#e2e2e2',
              fontSize: '14px',
              fontWeight: 500,
              border: 'none',
              cursor: carregando ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#555', margin: '4px 0 0' }}>
            Use as mesmas credenciais do{' '}
            <a
              href="https://moodle.ifsc.edu.br"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2d7a2d', textDecoration: 'none' }}
            >
              moodle.ifsc.edu.br
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}