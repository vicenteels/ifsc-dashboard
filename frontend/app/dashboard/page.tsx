'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Tarefa {
  id: number
  cmid: number
  link: string
  nome: string
  disciplina: string
  prazo: string
  prazoTimestamp: number
  criadaEm: string
  status: 'pendente' | 'enviada'
}

interface DadosTarefas {
  pendentes: Tarefa[]
  enviadas: Tarefa[]
}

function isUrgente(prazoTimestamp: number): boolean {
  if (!prazoTimestamp) return false
  const agora = Date.now() / 1000
  const tresDias = 3 * 24 * 60 * 60
  return prazoTimestamp > agora && prazoTimestamp - agora < tresDias
}

function isVencida(prazoTimestamp: number): boolean {
  if (!prazoTimestamp) return false
  return Date.now() / 1000 > prazoTimestamp
}

function getNomeDisciplina(disciplina: string): string {
  return disciplina.includes('-')
    ? disciplina.split('-').slice(1).join('-').trim()
    : disciplina
}

export default function DashboardPage() {
  const [dados, setDados] = useState<DadosTarefas | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [primeiroNome, setPrimeiroNome] = useState('')
  const [disciplinaFiltro, setDisciplinaFiltro] = useState<string | null>(null)
  const router = useRouter()

  async function buscarUsuario(token: string) {
    try {
      const resposta = await fetch(`http://localhost:3000/moodle/usuario?token=${token}`)
      const dados = await resposta.json()
      setPrimeiroNome(dados.primeiroNome)
    } catch {
      // silencioso — não impede o dashboard de carregar
    }
  }

  async function buscarTarefas(filtro?: string) {
    const token = localStorage.getItem('moodle_token')
    if (!token) { router.push('/login'); return }

    setCarregando(true)
    setErro('')

    try {
      const url = filtro
        ? `http://localhost:3000/moodle/tarefas?token=${token}&dataInicio=${filtro}`
        : `http://localhost:3000/moodle/tarefas?token=${token}`

      const resposta = await fetch(url)
      const dados = await resposta.json()

      if (!resposta.ok) { setErro('Erro ao buscar tarefas.'); return }
      setDados(dados)
    } catch {
      setErro('Erro ao conectar com o servidor.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('moodle_token')
    if (!token) { router.push('/login'); return }
    buscarUsuario(token)
    buscarTarefas()
  }, [])

  function handleLogout() {
    localStorage.removeItem('moodle_token')
    router.push('/login')
  }

  function handleFiltro() {
    setDisciplinaFiltro(null)
    buscarTarefas(dataInicio || undefined)
  }

  function handleLimparFiltro() {
    setDataInicio('')
    setDisciplinaFiltro(null)
    buscarTarefas()
  }

  const todasTarefas = dados ? [...dados.pendentes, ...dados.enviadas] : []
  const total = todasTarefas.length
  const totalPendentes = dados?.pendentes.length ?? 0
  const totalEnviadas = dados?.enviadas.length ?? 0

  // Agrupa por disciplina para o gráfico
  const porDisciplina: Record<string, { pendentes: number; enviadas: number }> = {}
  todasTarefas.forEach((t) => {
    const nome = getNomeDisciplina(t.disciplina)
    if (!porDisciplina[nome]) porDisciplina[nome] = { pendentes: 0, enviadas: 0 }
    if (t.status === 'pendente') porDisciplina[nome].pendentes++
    else porDisciplina[nome].enviadas++
  })

  // Aplica filtro de disciplina nas listas
  const pendentesVisiveis = disciplinaFiltro
    ? (dados?.pendentes ?? []).filter(t => getNomeDisciplina(t.disciplina) === disciplinaFiltro)
    : (dados?.pendentes ?? [])

  const enviadasVisiveis = disciplinaFiltro
    ? (dados?.enviadas ?? []).filter(t => getNomeDisciplina(t.disciplina) === disciplinaFiltro)
    : (dados?.enviadas ?? [])

  return (
    <main style={{ minHeight: '100vh', background: '#0f1117', fontFamily: 'var(--font-sans)' }}>

      {/* Header estilo Moodle/IFSC dark */}
      <header style={{
        background: '#1a1d27',
        borderBottom: '0.5px solid #2a2d3a',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Logo IFSC pequeno */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px' }}>
            <div style={{ width: '7px', height: '7px', background: 'transparent' }} />
            <div style={{ width: '7px', height: '7px', background: '#cc2222', borderRadius: '50%' }} />
            <div style={{ width: '7px', height: '7px', background: '#2d7a2d', borderRadius: '1px' }} />
            <div style={{ width: '7px', height: '7px', background: '#2d7a2d', borderRadius: '1px' }} />

            <div style={{ width: '7px', height: '7px', background: 'transparent' }} />
            <div style={{ width: '7px', height: '7px', background: '#2d7a2d', borderRadius: '1px' }} />
            <div style={{ width: '7px', height: '7px', background: '#2d7a2d', borderRadius: '1px' }} />
            <div style={{ width: '7px', height: '7px', background: 'transparent' }} />

            <div style={{ width: '7px', height: '7px', background: 'transparent' }} />
            <div style={{ width: '7px', height: '7px', background: '#2d7a2d', borderRadius: '1px' }} />
            <div style={{ width: '7px', height: '7px', background: '#2d7a2d', borderRadius: '1px' }} />
            <div style={{ width: '7px', height: '7px', background: '#2d7a2d', borderRadius: '1px' }} />

            <div style={{ width: '7px', height: '7px', background: 'transparent' }} />
            <div style={{ width: '7px', height: '7px', background: '#2d7a2d', borderRadius: '1px' }} />
            <div style={{ width: '7px', height: '7px', background: '#2d7a2d', borderRadius: '1px' }} />
            <div style={{ width: '7px', height: '7px', background: 'transparent' }} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#e2e2e2', letterSpacing: '0.06em' }}>INSTITUTO FEDERAL</div>
            <div style={{ fontSize: '9px', color: '#888', letterSpacing: '0.04em' }}>Santa Catarina</div>
          </div>
          <div style={{ width: '0.5px', height: '28px', background: '#2a2d3a', margin: '0 8px' }} />
          <span style={{ fontSize: '13px', color: '#888' }}>Dashboard</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            background: 'transparent', color: '#888', border: '0.5px solid #2a2d3a', cursor: 'pointer'
          }}>
            Sair
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Saudação */}
        {primeiroNome && (
          <div style={{ marginBottom: '28px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 500, color: '#e2e2e2', margin: '0 0 4px' }}>
              Olá, {primeiroNome}!
            </h2>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
              Aqui está um resumo das suas atividades no Moodle
            </p>
          </div>
        )}

        {carregando && (
          <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginTop: '60px' }}>
            Buscando suas tarefas no Moodle...
          </p>
        )}

        {erro && (
          <p style={{ color: '#E24B4A', fontSize: '14px', textAlign: 'center' }}>{erro}</p>
        )}

        {dados && !carregando && (
          <>
            {/* Cards de resumo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Total', valor: total, cor: '#7F77DD' },
                { label: 'Pendentes', valor: totalPendentes, cor: '#EF9F27' },
                { label: 'Enviadas', valor: totalEnviadas, cor: '#1D9E75' },
              ].map(({ label, valor, cor }) => (
                <div key={label} style={{ background: '#1a1d27', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '26px', fontWeight: 500, color: cor }}>{valor}</div>
                </div>
              ))}
            </div>

            {/* Gráfico por disciplina — clicável */}
            <div style={{ background: '#1a1d27', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#888' }}>Tarefas por disciplina</div>
                {disciplinaFiltro && (
                  <button onClick={() => setDisciplinaFiltro(null)} style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '6px',
                    background: '#0f1117', color: '#888', border: '0.5px solid #2a2d3a', cursor: 'pointer'
                  }}>
                    Mostrar todas
                  </button>
                )}
              </div>
              {Object.entries(porDisciplina).map(([disciplina, counts]) => {
                const selecionada = disciplinaFiltro === disciplina
                const totalDisciplina = counts.enviadas + counts.pendentes
                return (
                  <div
                    key={disciplina}
                    onClick={() => setDisciplinaFiltro(selecionada ? null : disciplina)}
                    style={{
                      marginBottom: '10px', cursor: 'pointer', padding: '6px 8px',
                      borderRadius: '8px', transition: 'background 0.15s',
                      background: selecionada ? '#0f1117' : 'transparent',
                      border: selecionada ? '0.5px solid #2a2d3a' : '0.5px solid transparent',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: selecionada ? '#e2e2e2' : '#aaa', marginBottom: '4px', fontWeight: selecionada ? 500 : 400 }}>
                      {disciplina}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {counts.enviadas > 0 && (
                        <div style={{
                          height: '18px', borderRadius: '4px', background: '#04342C',
                          width: `${(counts.enviadas / totalDisciplina) * 100}%`,
                          display: 'flex', alignItems: 'center', paddingLeft: '6px',
                          fontSize: '10px', color: '#1D9E75', fontWeight: 500, minWidth: '40px'
                        }}>
                          {counts.enviadas} env.
                        </div>
                      )}
                      {counts.pendentes > 0 && (
                        <div style={{
                          height: '18px', borderRadius: '4px', background: '#412402',
                          width: `${(counts.pendentes / totalDisciplina) * 100}%`,
                          display: 'flex', alignItems: 'center', paddingLeft: '6px',
                          fontSize: '10px', color: '#EF9F27', fontWeight: 500, minWidth: '40px'
                        }}>
                          {counts.pendentes} pend.
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Filtro de data */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1a1d27', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#888' }}>Filtrar por data de criação:</span>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                style={{ background: '#0f1117', border: '0.5px solid #2a2d3a', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', color: '#e2e2e2' }}
              />
              <button onClick={handleFiltro} style={{ fontSize: '12px', padding: '5px 14px', borderRadius: '6px', background: '#7F77DD', color: '#EEEDFE', border: 'none', cursor: 'pointer' }}>
                Aplicar
              </button>
              {dataInicio && (
                <button onClick={handleLimparFiltro} style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '6px', background: '#1a1d27', color: '#888', border: '0.5px solid #2a2d3a', cursor: 'pointer' }}>
                  Limpar
                </button>
              )}
            </div>

            {/* Label de filtro ativo */}
            {disciplinaFiltro && (
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>Mostrando:</span>
                <span style={{ fontSize: '12px', padding: '2px 10px', borderRadius: '99px', background: '#26215C', color: '#AFA9EC', fontWeight: 500 }}>
                  {disciplinaFiltro}
                </span>
              </div>
            )}

            {/* Pendentes */}
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#888', marginBottom: '8px' }}>
              Pendentes ({pendentesVisiveis.length})
            </div>
            {pendentesVisiveis.length === 0 && (
              <div style={{ background: '#1a1d27', borderRadius: '10px', padding: '16px', marginBottom: '8px', color: '#888', fontSize: '13px' }}>
                Nenhuma tarefa pendente.
              </div>
            )}
            {pendentesVisiveis.map((tarefa) => {
              const urgente = isUrgente(tarefa.prazoTimestamp)
              const vencida = isVencida(tarefa.prazoTimestamp)
              return (
                <a key={tarefa.id} href={tarefa.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    style={{
                      background: vencida || urgente ? '#1f1519' : '#1a1d27',
                      borderRadius: '10px', padding: '14px 16px', marginBottom: '8px',
                      borderLeft: `3px solid ${vencida || urgente ? '#E24B4A' : '#EF9F27'}`,
                      cursor: 'pointer', transition: 'opacity 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#e2e2e2', marginBottom: '3px' }}>{tarefa.nome}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>
                      {getNomeDisciplina(tarefa.disciplina)} · Prazo: {tarefa.prazo}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {vencida && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: '#501313', color: '#E24B4A', fontWeight: 500 }}>prazo vencido</span>}
                      {urgente && !vencida && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: '#501313', color: '#E24B4A', fontWeight: 500 }}>vence em breve</span>}
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: '#412402', color: '#EF9F27', fontWeight: 500 }}>pendente</span>
                    </div>
                  </div>
                </a>
              )
            })}

            {/* Enviadas */}
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#888', marginBottom: '8px', marginTop: '20px' }}>
              Enviadas ({enviadasVisiveis.length})
            </div>
            {enviadasVisiveis.length === 0 && (
              <div style={{ background: '#1a1d27', borderRadius: '10px', padding: '16px', color: '#888', fontSize: '13px' }}>
                Nenhuma tarefa enviada.
              </div>
            )}
            {enviadasVisiveis.map((tarefa) => (
              <a key={tarefa.id} href={tarefa.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  style={{
                    background: '#1a1d27', borderRadius: '10px', padding: '14px 16px',
                    marginBottom: '8px', borderLeft: '3px solid #1D9E75',
                    cursor: 'pointer', transition: 'opacity 0.15s',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#e2e2e2', marginBottom: '3px' }}>{tarefa.nome}</div>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>
                    {getNomeDisciplina(tarefa.disciplina)} · Prazo: {tarefa.prazo}
                  </div>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: '#04342C', color: '#1D9E75', fontWeight: 500 }}>enviada</span>
                </div>
              </a>
            ))}
          </>
        )}
      </div>
    </main>
  )
}