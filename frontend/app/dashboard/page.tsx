'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = '/api'

interface Tarefa {
  id: number
  cmid: number
  link: string
  nome: string
  disciplina: string
  tipo: 'tarefa'
  prazo: string
  prazoTimestamp: number
  status: 'pendente' | 'enviada'
  dataEnvio: string | null
  dataEnvioTimestamp: number | null
}

interface Questionario {
  id: number
  cmid: number
  link: string
  nome: string
  disciplina: string
  courseId: number
  tipo: 'questionario'
  nota: number | null
  notaMaxima: number
  totalQuestoes: number
  respondido: boolean
  timeopen: number
  timeclose: number
}

type Atividade = Tarefa | Questionario

interface DadosTarefas {
  pendentes: Tarefa[]
  enviadas: Tarefa[]
}

type StatusTarefa = 'enviada_prazo' | 'enviada_atraso' | 'pendente_prazo' | 'pendente_atraso'

function getStatusTarefa(tarefa: Tarefa): StatusTarefa {
  const agora = Date.now() / 1000
  const vencida = tarefa.prazoTimestamp < agora
  const enviadaAosTempo = tarefa.dataEnvioTimestamp && tarefa.dataEnvioTimestamp <= tarefa.prazoTimestamp

  if (tarefa.status === 'enviada') {
    return enviadaAosTempo ? 'enviada_prazo' : 'enviada_atraso'
  } else {
    return vencida ? 'pendente_atraso' : 'pendente_prazo'
  }
}

function getCorStatus(status: StatusTarefa, isDark: boolean): string {
  switch (status) {
    case 'enviada_prazo':
      return '#1D9E75'
    case 'enviada_atraso':
      return '#EF9F27'
    case 'pendente_prazo':
      return '#FDD835'
    case 'pendente_atraso':
      return '#E24B4A'
  }
}

function getTextoStatus(status: StatusTarefa): string {
  switch (status) {
    case 'enviada_prazo':
      return 'enviada no prazo'
    case 'enviada_atraso':
      return 'enviada atrasada'
    case 'pendente_prazo':
      return 'pendente'
    case 'pendente_atraso':
      return 'vencida'
  }
}

function getNomeDisciplina(disciplina: string): string {
  return disciplina.includes('-')
    ? disciplina.split('-').slice(1).join('-').trim()
    : disciplina
}

function isTarefa(atividade: Atividade): atividade is Tarefa {
  return atividade.tipo === 'tarefa'
}

function isQuestionario(atividade: Atividade): atividade is Questionario {
  return atividade.tipo === 'questionario'
}

export default function DashboardPage() {
  const [tarefas, setTarefas] = useState<DadosTarefas | null>(null)
  const [questionarios, setQuestionarios] = useState<Questionario[]>([])
  const [nomeCursos, setNomeCursos] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [primeiroNome, setPrimeiroNome] = useState('')
  const [disciplinaFiltro, setDisciplinaFiltro] = useState<string | null>(null)
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'tarefa' | 'questionario'>('todos')
  const [mobileView, setMobileView] = useState<'resumo' | 'dashboard'>('dashboard')
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 1024
  })
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = window.localStorage.getItem('darkMode')
    return saved === null ? true : saved === 'true'
  })
  const router = useRouter()

  // Cores baseadas no tema
  const cores = darkMode ? {
    bg: '#0f1117',
    bgSecundario: '#1a1d27',
    text: '#e2e2e2',
    textMuted: '#888',
    border: '#2a2d3a',
    inputBg: '#0f1117',
  } : {
    bg: '#f5f5f5',
    bgSecundario: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#666',
    border: '#e0e0e0',
    inputBg: '#f0f0f0',
  }

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 1024)
    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
    return () => window.removeEventListener('resize', updateIsMobile)
  }, [])

  async function buscarUsuario(token: string) {
    try {
      const resposta = await fetch(`${API_BASE}/moodle/usuario?token=${encodeURIComponent(token)}`)
      const dados = await resposta.json()
      setPrimeiroNome(dados.primeiroNome)
    } catch {
      // silencioso
    }
  }

  async function buscarCursos(token: string) {
    try {
      const resposta = await fetch(`${API_BASE}/moodle/cursos?token=${encodeURIComponent(token)}`)
      const dados = await resposta.json()
      setNomeCursos(dados)
    } catch {
      // silencioso
    }
  }

  async function buscarTarefas(filtro?: string) {
    const token = localStorage.getItem('moodle_token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const url = filtro
        ? `${API_BASE}/moodle/tarefas?token=${encodeURIComponent(token)}&dataInicio=${encodeURIComponent(filtro)}`
        : `${API_BASE}/moodle/tarefas?token=${encodeURIComponent(token)}`

      const resposta = await fetch(url)
      const dados = await resposta.json()
      if (!resposta.ok) {
        setErro('Erro ao buscar tarefas.')
        return
      }
      setTarefas(dados)
    } catch {
      setErro('Erro ao conectar com o servidor.')
    }
  }

  async function buscarQuestionarios(userid: string) {
    const token = localStorage.getItem('moodle_token')
    if (!token) return

    try {
      console.log('[Questionarios] Buscar para userid:', userid)
      const resposta = await fetch(`${API_BASE}/moodle/questionarios?token=${encodeURIComponent(token)}&userid=${encodeURIComponent(userid)}`)
      const dados = await resposta.json()
      console.log('[Questionarios] Response status:', resposta.status, 'ok:', resposta.ok)
      console.log('[Questionarios] Dados:', dados)
      if (!resposta.ok) {
        setErro('Erro ao buscar questionários.')
        return
      }
      setQuestionarios(dados)
    } catch {
      // silencioso
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('moodle_token')
    if (!token) {
      router.push('/login')
      return
    }
    // Busca usuário primeiro para pegar o userid
    setTimeout(() => {
      void buscarUsuario(token)
      void buscarCursos(token)
      void buscarTarefas()
    }, 0)

    // Busca questionários com o userid correto
    fetch(`${API_BASE}/moodle/usuario?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(dados => {
        console.log('Dados do usuário:', dados)
        console.log('Userid:', dados.userid)
        void buscarQuestionarios(dados.userid.toString())
      })
      .catch(() => {
        // Se falhar, tenta com userid padrão
      })

    setTimeout(() => setCarregando(false), 0)
  }, [])

  function handleLogout() {
    localStorage.removeItem('moodle_token')
    router.push('/login')
  }

  function handleFiltroData() {
    buscarTarefas(dataInicio || undefined)
  }

  function handleLimparFiltro() {
    setDataInicio('')
    setDisciplinaFiltro(null)
    buscarTarefas()
  }

  function toggleDarkMode() {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', newMode ? 'true' : 'false')
  }

  // Combina tarefas e questionários
  const todasTarefas = tarefas ? [...tarefas.pendentes, ...tarefas.enviadas] : []
  const questionariosComNome = questionarios.map(q => ({
    ...q,
    disciplina: nomeCursos[q.courseId] || `Curso ${q.courseId}`,
  }))
  const todasAtividades: Atividade[] = [...todasTarefas, ...questionariosComNome]

  const disciplinasDisponiveis = Array.from(
    new Set(todasAtividades.map(a => getNomeDisciplina(a.disciplina)))
  ).sort()

  // Calcula totais
  const totalTarefasPendentes = tarefas?.pendentes.length ?? 0
  const totalTarefasEnviadas = tarefas?.enviadas.length ?? 0
  const totalTarefas = todasTarefas.length

  const totalQuestionariosRespondidos = questionariosComNome.filter(q => q.respondido).length
  const totalQuestionariosPendentes = questionariosComNome.length - totalQuestionariosRespondidos
  const totalQuestionarios = questionariosComNome.length

  const totalAtividades = totalTarefas + totalQuestionarios

  // Calcula média de questionários
  const questionariosComNota = questionariosComNome.filter(q => q.respondido && q.nota !== null)
  const mediaQuestionarios = questionariosComNota.length > 0
    ? (questionariosComNota.reduce((sum, q) => sum + (q.nota || 0), 0) / questionariosComNota.length)
    : 0

  // Aplica filtros
  const atividadesFiltradas = todasAtividades.filter(a => {
    const tipoOk = tipoFiltro === 'todos' || a.tipo === tipoFiltro
    const disciplinaOk = !disciplinaFiltro || getNomeDisciplina(a.disciplina) === disciplinaFiltro
    return tipoOk && disciplinaOk
  })

  // Agrupa por disciplina para gráficos
  const porDisciplina: Record<string, { tarefas: number; questionarios: number; mediaNotas: number; contagem: number }> = {}
  todasAtividades.forEach((a) => {
    const nome = getNomeDisciplina(a.disciplina)
    if (!porDisciplina[nome]) {
      porDisciplina[nome] = { tarefas: 0, questionarios: 0, mediaNotas: 0, contagem: 0 }
    }
    if (isTarefa(a)) {
      porDisciplina[nome].tarefas++
    } else {
      porDisciplina[nome].questionarios++
      if (a.respondido && a.nota !== null) {
        porDisciplina[nome].mediaNotas += a.nota
        porDisciplina[nome].contagem++
      }
    }
  })

  // Calcula média por disciplina
  Object.keys(porDisciplina).forEach(disc => {
    if (porDisciplina[disc].contagem > 0) {
      porDisciplina[disc].mediaNotas = porDisciplina[disc].mediaNotas / porDisciplina[disc].contagem
    }
  })

  // Ordena atividades
  const atividadesOrdenadas = [...atividadesFiltradas].sort((a, b) => {
    if (a.tipo === 'questionario' && b.tipo === 'tarefa') return 1
    if (a.tipo === 'tarefa' && b.tipo === 'questionario') return -1
    if (isTarefa(a) && isTarefa(b)) {
      const statusA = getStatusTarefa(a)
      const statusB = getStatusTarefa(b)
      const ordem = ['pendente_atraso', 'pendente_prazo', 'enviada_atraso', 'enviada_prazo']
      return ordem.indexOf(statusA) - ordem.indexOf(statusB)
    }
    return 0
  })

  return (
    <main style={{
      minHeight: '100vh',
      background: cores.bg,
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'background 0.3s',
    }}>

      {/* Header */}
      <header style={{
        background: cores.bgSecundario,
        borderBottom: `0.5px solid ${cores.border}`,
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        transition: 'all 0.3s',
      }}>
        {/* Logo IFScore */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em' }}>
            <span style={{ color: '#2d7a2d' }}>IFSc</span>
            <span style={{ color: '#cc2222' }}>ore</span>
          </div>
          <div style={{ width: '0.5px', height: '28px', background: cores.border, margin: '0 8px' }} />
          <span style={{ fontSize: '13px', color: cores.textMuted }}>Dashboard</span>
        </div>

        {isMobile && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setMobileView('resumo')}
              style={{
                fontSize: '12px',
                padding: '5px 10px',
                borderRadius: '6px',
                background: mobileView === 'resumo' ? '#7F77DD' : '#1a1d27',
                color: mobileView === 'resumo' ? '#EEEDFE' : cores.textMuted,
                border: `0.5px solid ${cores.border}`,
                cursor: 'pointer',
              }}
            >
              Resumo
            </button>
            <button
              onClick={() => setMobileView('dashboard')}
              style={{
                fontSize: '12px',
                padding: '5px 10px',
                borderRadius: '6px',
                background: mobileView === 'dashboard' ? '#7F77DD' : '#1a1d27',
                color: mobileView === 'dashboard' ? '#EEEDFE' : cores.textMuted,
                border: `0.5px solid ${cores.border}`,
                cursor: 'pointer',
              }}
            >
              Dashboard
            </button>
          </div>
        )}

        {/* Direita do header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Toggle dark/light mode */}
          <button
            onClick={toggleDarkMode}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              background: darkMode ? '#1f4d1f' : '#ffd54f',
              border: `0.5px solid ${cores.border}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              transition: 'all 0.3s',
            }}
            title={darkMode ? 'Modo claro' : 'Modo escuro'}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: darkMode ? '#2d7a2d' : '#fbc02d',
              transition: 'transform 0.3s',
              transform: darkMode ? 'translateX(0)' : 'translateX(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
            }}>
              {darkMode ? '🌙' : '☀️'}
            </div>
          </button>

          {primeiroNome && (
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: '#1f4d1f', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '12px', fontWeight: 500, color: '#2d7a2d'
            }}>
              {primeiroNome[0].toUpperCase()}
            </div>
          )}
          <button onClick={handleLogout} style={{
            fontSize: '12px', padding: '5px 14px', borderRadius: '6px',
            background: 'transparent', color: cores.textMuted, border: `0.5px solid ${cores.border}`, cursor: 'pointer',
            transition: 'all 0.3s',
          }}>
            Sair
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar à esquerda */}
        {(!isMobile || mobileView === 'resumo') && (
          <div style={{
            width: '280px', background: cores.bgSecundario, borderRight: `0.5px solid ${cores.border}`,
          padding: '24px 16px', overflowY: 'auto', maxHeight: 'calc(100vh - 56px)',
          transition: 'all 0.3s',
        }}>
          {!carregando && (
            <>
              {/* Card média questionários */}
              <div style={{
                background: darkMode ? '#26215C' : '#e8e4f3',
                borderRadius: '10px', padding: '14px',
                marginBottom: '16px',
                border: darkMode ? '0.5px solid #534AB7' : '0.5px solid #d0c8e8',
                transition: 'all 0.3s',
              }}>
                <div style={{ fontSize: '11px', color: darkMode ? '#AFA9EC' : '#7c77a8', marginBottom: '4px' }}>Média Questionários</div>
                <div style={{ fontSize: '24px', fontWeight: 500, color: darkMode ? '#AFA9EC' : '#7c77a8', marginBottom: '4px' }}>
                  {mediaQuestionarios > 0 ? mediaQuestionarios.toFixed(2) : '-'}
                </div>
                <div style={{ fontSize: '10px', color: darkMode ? '#9d9bc7' : '#9d9bc7' }}>
                  {questionariosComNota.length} respondidos
                </div>
              </div>

              {/* Indicadores */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: cores.textMuted, marginBottom: '8px', fontWeight: 500 }}>Resumo</div>

                {[
                  { label: 'Tarefas Enviadas', valor: totalTarefasEnviadas, cor: '#1D9E75' },
                  { label: 'Tarefas Pendentes', valor: totalTarefasPendentes, cor: '#EF9F27' },
                  { label: 'Questionários Respondidos', valor: totalQuestionariosRespondidos, cor: '#2d7a2d' },
                  { label: 'Questionários Pendentes', valor: totalQuestionariosPendentes, cor: cores.textMuted },
                ].map(({ label, valor, cor }) => (
                  <div key={label} style={{
                    marginBottom: '8px', padding: '8px', background: cores.inputBg, borderRadius: '6px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.3s',
                  }}>
                    <span style={{ fontSize: '10px', color: cores.textMuted }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: cor }}>{valor}</span>
                  </div>
                ))}
              </div>

              {/* Gráfico Pizza */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: cores.textMuted, marginBottom: '8px', fontWeight: 500 }}>Composição</div>
                <div style={{ display: 'flex', height: '60px', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    flex: totalTarefas,
                    background: darkMode ? '#412402' : '#ffe0b2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#EF9F27',
                    fontWeight: 500,
                  }}>
                    {totalTarefas > 0 && `${Math.round(totalTarefas / totalAtividades * 100)}%`}
                  </div>
                  <div style={{
                    flex: totalQuestionarios,
                    background: darkMode ? '#1f4d1f' : '#c8e6c9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#2d7a2d',
                    fontWeight: 500,
                  }}>
                    {totalQuestionarios > 0 && `${Math.round(totalQuestionarios / totalAtividades * 100)}%`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#EF9F27', borderRadius: '2px' }} />
                    <span style={{ color: cores.textMuted }}>Tarefas</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#2d7a2d', borderRadius: '2px' }} />
                    <span style={{ color: cores.textMuted }}>Quiz</span>
                  </div>
                </div>
              </div>

              {/* Gráfico Disciplinas */}
              <div>
                <div style={{ fontSize: '11px', color: cores.textMuted, marginBottom: '8px', fontWeight: 500 }}>Por Disciplina</div>
                {Object.entries(porDisciplina).slice(0, 5).map(([disc, dados]) => (
                  <div key={disc} style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '10px', color: cores.textMuted, marginBottom: '3px', lineHeight: 1 }}>
                      {disc.length > 20 ? disc.substring(0, 17) + '...' : disc}
                    </div>
                    <div style={{ display: 'flex', gap: '2px', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
                      {dados.tarefas > 0 && (
                        <div style={{
                          flex: dados.tarefas,
                          background: darkMode ? '#412402' : '#ffe0b2',
                          minWidth: '4px',
                        }} />
                      )}
                      {dados.questionarios > 0 && (
                        <div style={{
                          flex: dados.questionarios,
                          background: dados.mediaNotas >= 8 ? (darkMode ? '#1f4d1f' : '#c8e6c9') : dados.mediaNotas >= 6 ? (darkMode ? '#2d6d2d' : '#a5d6a7') : (darkMode ? '#1f4d1f' : '#c8e6c9'),
                          minWidth: '4px',
                        }} />
                      )}
                    </div>
                    {dados.mediaNotas > 0 && (
                      <div style={{ fontSize: '9px', color: '#2d7a2d', marginTop: '2px' }}>
                        Média: {dados.mediaNotas.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          </div>
        )}

        {/* Conteúdo principal */}
        {(!isMobile || mobileView === 'dashboard') && (
          <div style={{ flex: 1, padding: '32px 24px', maxWidth: '720px', margin: '0 auto', transition: 'all 0.3s' }}>

          {/* Saudação */}
          {primeiroNome && (
            <div style={{ marginBottom: '28px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 500, color: cores.text, margin: '0 0 4px' }}>
                Olá, {primeiroNome}!
              </h2>
              <p style={{ fontSize: '13px', color: cores.textMuted, margin: 0 }}>
                Aqui está um resumo das suas atividades no Moodle
              </p>
            </div>
          )}

          {carregando && (
            <p style={{ color: cores.textMuted, fontSize: '14px', textAlign: 'center', marginTop: '60px' }}>
              Buscando suas atividades no Moodle...
            </p>
          )}

          {erro && (
            <p style={{ color: '#E24B4A', fontSize: '14px', textAlign: 'center' }}>{erro}</p>
          )}

          {!carregando && (
            <>
              {/* Cards resumo */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {[
                  { label: 'Total Geral', valor: totalAtividades, cor: '#7F77DD' },
                  { label: 'Total Tarefas', valor: totalTarefas, cor: '#EF9F27' },
                  { label: 'Tarefas Enviadas', valor: totalTarefasEnviadas, cor: '#1D9E75' },
                  { label: 'Tarefas Pendentes', valor: totalTarefasPendentes, cor: '#EF9F27' },
                ].map(({ label, valor, cor }) => (
                  <div key={label} style={{ background: cores.bgSecundario, borderRadius: '10px', padding: '12px', transition: 'all 0.3s' }}>
                    <div style={{ fontSize: '10px', color: cores.textMuted, marginBottom: '3px' }}>{label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 500, color: cor }}>{valor}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {[
                  { label: 'Total Questionários', valor: totalQuestionarios, cor: '#2d7a2d' },
                  { label: 'Respondidos', valor: totalQuestionariosRespondidos, cor: '#2d7a2d' },
                  { label: 'Pendentes', valor: totalQuestionariosPendentes, cor: cores.textMuted },
                ].map(({ label, valor, cor }) => (
                  <div key={label} style={{ background: cores.bgSecundario, borderRadius: '10px', padding: '12px', transition: 'all 0.3s' }}>
                    <div style={{ fontSize: '10px', color: cores.textMuted, marginBottom: '3px' }}>{label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 500, color: cor }}>{valor}</div>
                  </div>
                ))}
              </div>

              {/* Filtro por tipo */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {(['todos', 'tarefa', 'questionario'] as const).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setTipoFiltro(tipo)}
                    style={{
                      fontSize: '12px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      background: tipoFiltro === tipo ? '#7F77DD' : cores.bgSecundario,
                      color: tipoFiltro === tipo ? '#EEEDFE' : cores.textMuted,
                      border: tipoFiltro === tipo ? 'none' : `0.5px solid ${cores.border}`,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.3s',
                    }}
                  >
                    {tipo === 'todos' ? 'Todas' : tipo === 'tarefa' ? 'Tarefas' : 'Questionários'}
                  </button>
                ))}
              </div>

              {/* Filtros */}
              <div style={{ background: cores.bgSecundario, borderRadius: '10px', padding: '12px 16px', marginBottom: '12px', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: cores.textMuted }}>Filtrar por data:</span>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    style={{
                      background: cores.inputBg, border: `0.5px solid ${cores.border}`, borderRadius: '6px',
                      padding: '5px 10px', fontSize: '12px', color: cores.text, transition: 'all 0.3s',
                    }}
                  />
                  <button onClick={handleFiltroData} style={{
                    fontSize: '12px', padding: '5px 14px', borderRadius: '6px',
                    background: '#7F77DD', color: '#EEEDFE', border: 'none', cursor: 'pointer',
                  }}>
                    Aplicar
                  </button>
                  {dataInicio && (
                    <button onClick={handleLimparFiltro} style={{
                      fontSize: '12px', padding: '5px 10px', borderRadius: '6px',
                      background: cores.bgSecundario, color: cores.textMuted, border: `0.5px solid ${cores.border}`, cursor: 'pointer',
                    }}>
                      Limpar
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: cores.textMuted }}>Filtrar por disciplina:</span>
                  <select
                    value={disciplinaFiltro || ''}
                    onChange={(e) => setDisciplinaFiltro(e.target.value || null)}
                    style={{
                      background: cores.inputBg,
                      border: `0.5px solid ${cores.border}`,
                      borderRadius: '6px', padding: '5px 10px',
                      fontSize: '12px', color: cores.text,
                      transition: 'all 0.3s',
                    }}
                  >
                    <option value="">Todas</option>
                    {disciplinasDisponiveis.map(disc => (
                      <option key={disc} value={disc}>{disc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Labels filtros ativos */}
              {(dataInicio || disciplinaFiltro) && (
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: cores.textMuted }}>Filtros ativos:</span>
                  {dataInicio && (
                    <span style={{
                      fontSize: '12px', padding: '2px 10px', borderRadius: '99px',
                      background: darkMode ? '#1f4d1f' : '#c8e6c9',
                      color: '#2d7a2d', fontWeight: 500
                    }}>
                      Até {dataInicio}
                    </span>
                  )}
                  {disciplinaFiltro && (
                    <span style={{
                      fontSize: '12px', padding: '2px 10px', borderRadius: '99px',
                      background: darkMode ? '#26215C' : '#e8e4f3',
                      color: darkMode ? '#AFA9EC' : '#7c77a8', fontWeight: 500
                    }}>
                      {disciplinaFiltro}
                    </span>
                  )}
                </div>
              )}

              {/* Lista de atividades */}
              <div style={{ fontSize: '12px', fontWeight: 500, color: cores.textMuted, marginBottom: '8px' }}>
                Atividades ({atividadesOrdenadas.length})
              </div>

              {atividadesOrdenadas.length === 0 && (
                <div style={{ background: cores.bgSecundario, borderRadius: '10px', padding: '16px', color: cores.textMuted, fontSize: '13px', transition: 'all 0.3s' }}>
                  Nenhuma atividade encontrada.
                </div>
              )}

              {atividadesOrdenadas.map((atividade) => {
                if (isTarefa(atividade)) {
                  const status = getStatusTarefa(atividade)
                  const cor = getCorStatus(status, darkMode)

                  return (
                    <a key={`tarefa-${atividade.id}`} href={atividade.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                      <div
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        style={{
                          background: cores.bgSecundario,
                          borderRadius: '10px',
                          padding: '14px 16px',
                          marginBottom: '8px',
                          borderLeft: `3px solid ${cor}`,
                          cursor: 'pointer',
                          transition: 'opacity 0.15s',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 500, color: cores.text, marginBottom: '3px' }}>
                          {atividade.nome}
                        </div>
                        <div style={{ fontSize: '11px', color: cores.textMuted, marginBottom: '6px' }}>
                          {getNomeDisciplina(atividade.disciplina)} · Prazo: {atividade.prazo}
                        </div>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: `${cor}33`, color: cor, fontWeight: 500 }}>
                          {getTextoStatus(status)}
                        </span>
                      </div>
                    </a>
                  )
                } else {
                  return (
                    <a key={`quiz-${atividade.id}`} href={atividade.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                      <div
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        style={{
                          background: cores.bgSecundario,
                          borderRadius: '10px',
                          padding: '14px 16px',
                          marginBottom: '8px',
                          borderLeft: `3px solid ${atividade.respondido ? '#AFA9EC' : cores.textMuted}`,
                          cursor: 'pointer',
                          transition: 'opacity 0.15s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: cores.text, marginBottom: '3px' }}>
                            {atividade.nome}
                          </div>
                          <div style={{ fontSize: '11px', color: cores.textMuted, marginBottom: '6px' }}>
                            {getNomeDisciplina(atividade.disciplina)}
                          </div>
                          <span style={{
                            fontSize: '10px', padding: '2px 8px', borderRadius: '99px',
                            background: atividade.respondido ? (darkMode ? '#26215C' : '#e8e4f3') : cores.inputBg,
                            color: atividade.respondido ? (darkMode ? '#AFA9EC' : '#7c77a8') : cores.textMuted,
                            fontWeight: 500
                          }}>
                            {atividade.respondido ? 'respondido' : 'pendente'}
                          </span>
                        </div>
                        {atividade.respondido && atividade.nota !== null && (
                          <div style={{ fontSize: '14px', fontWeight: 500, color: darkMode ? '#AFA9EC' : '#7c77a8', marginLeft: '12px', whiteSpace: 'nowrap' }}>
                            {atividade.nota.toFixed(2)}/10
                          </div>
                        )}
                      </div>
                    </a>
                  )
                }
              })}
            </>
          )}
          </div>
        )}
      </div>
    </main>
  )
}
