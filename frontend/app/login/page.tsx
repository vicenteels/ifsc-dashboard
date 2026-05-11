'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const router = useRouter()

  async function handleDemoLogin() {
    setCarregando(true)
    setErro('')

    try {
      const resposta = await fetch('/api/moodle/demo-login', { method: 'POST' })
      const dados = await resposta.json().catch(() => null)

      if (!resposta.ok || !dados?.token) {
        setErro('Erro ao ativar o modo demo.')
        return
      }

      localStorage.setItem('moodle_token', dados.token)
      localStorage.setItem('demo_mode', 'true')
      localStorage.setItem('demo_last_activity', Date.now().toString())
      localStorage.setItem('darkMode', darkMode ? 'true' : 'false')
      router.push('/dashboard')
    } catch {
      setErro('Erro ao conectar com o servidor.')
    } finally {
      setCarregando(false)
    }
  }

  async function handleLogin() {
    if (!username || !password) {
      setErro('Preencha o usuÃ¡rio e a senha.')
      return
    }

    setCarregando(true)
    setErro('')

    try {
      const resposta = await fetch('/api/moodle/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const dados = await resposta.json().catch(() => null)

      if (!resposta.ok || !dados?.token) {
      setErro('Usuário ou senha incorretos.')
        return
      }

      localStorage.setItem('moodle_token', dados.token)
      localStorage.removeItem('demo_mode')
      localStorage.removeItem('demo_last_activity')
      localStorage.setItem('darkMode', darkMode ? 'true' : 'false')
      router.push('/dashboard')
    } catch {
      setErro('Erro ao conectar com o servidor.')
    } finally {
      setCarregando(false)
    }
  }

  const bgColor = darkMode ? '#0f1117' : '#f5f5f5'
  const cardBg = darkMode ? '#1a1d27' : '#ffffff'
  const textColor = darkMode ? '#e2e2e2' : '#1a1a1a'
  const textMuted = darkMode ? '#888' : '#666'
  const borderColor = darkMode ? '#2a2d3a' : '#e0e0e0'
  const inputBg = darkMode ? '#0f1117' : '#f0f0f0'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        transition: 'background 0.3s',
      }}
    >
      {/* Header com toggle dark/light */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '12px', color: textMuted }}>
          {darkMode ? 'ðŸŒ™' : 'â˜€ï¸'}
        </span>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            background: darkMode ? '#1f4d1f' : '#ffd54f',
            border: `0.5px solid ${borderColor}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
            transition: 'all 0.3s',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: darkMode ? '#2d7a2d' : '#fbc02d',
              transition: 'transform 0.3s',
              transform: darkMode ? 'translateX(0)' : 'translateX(20px)',
            }}
          />
        </button>
      </div>

      <div
        style={{
          background: cardBg,
          borderRadius: '16px',
          padding: '40px 36px',
          width: '100%',
          maxWidth: '380px',
          border: `0.5px solid ${borderColor}`,
          boxShadow: darkMode
            ? '0 4px 12px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s',
        }}
      >
        {/* Logo IFScore */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          {/* Grid logo IFSC */}
          <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px' }}>
              <div style={{ width: '12px', height: '12px', background: 'transparent' }} />
              <div style={{ width: '12px', height: '12px', background: '#cc2222', borderRadius: '50%' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />

              <div style={{ width: '12px', height: '12px', background: 'transparent' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: 'transparent' }} />

              <div style={{ width: '12px', height: '12px', background: 'transparent' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />

              <div style={{ width: '12px', height: '12px', background: 'transparent' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: '#2d7a2d', borderRadius: '1px' }} />
              <div style={{ width: '12px', height: '12px', background: 'transparent' }} />
            </div>
          </div>

          {/* Texto IFScore */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>
              <span style={{ color: '#2d7a2d' }}>IFSc</span>
              <span style={{ color: '#cc2222' }}>ore</span>
            </div>
            <div style={{ fontSize: '11px', color: textMuted, letterSpacing: '0.04em' }}>
              Dashboard de Atividades
            </div>
          </div>

          <div
            style={{
              marginTop: '12px',
              width: '100%',
              borderTop: `0.5px solid ${borderColor}`,
              paddingTop: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '13px', color: textMuted }}>Acesse com suas credenciais do Moodle</div>
          </div>
        </div>

        {/* Campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: textMuted, display: 'block', marginBottom: '6px' }}>
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
                background: inputBg,
                border: `0.5px solid ${borderColor}`,
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: textColor,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.3s',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: textMuted, display: 'block', marginBottom: '6px' }}>
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
                background: inputBg,
                border: `0.5px solid ${borderColor}`,
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: textColor,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.3s',
              }}
            />
          </div>

          {erro && <p style={{ fontSize: '12px', color: '#E24B4A', margin: 0 }}>{erro}</p>}

          <button
            onClick={handleLogin}
            disabled={carregando}
            style={{
              marginTop: '4px',
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              background: carregando ? (darkMode ? '#1f4d1f' : '#e0e0e0') : '#2d7a2d',
              color: carregando ? (darkMode ? '#888' : '#999') : '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              border: 'none',
              cursor: carregando ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            onClick={handleDemoLogin}
            disabled={carregando}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              background: 'transparent',
              color: darkMode ? '#FDD835' : '#7c6a00',
              fontSize: '14px',
              fontWeight: 600,
              border: `0.5px solid ${borderColor}`,
              cursor: carregando ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              marginTop: '10px',
            }}
          >
            Acessar Demo
          </button>

          <p style={{ textAlign: 'center', fontSize: '11px', color: textMuted, margin: '8px 0 0' }}>
            Modo demo usa dados fictícios para testar a plataforma (sem credenciais do Moodle).
          </p>

          <p style={{ textAlign: 'center', fontSize: '12px', color: textMuted, margin: '4px 0 0' }}>
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
