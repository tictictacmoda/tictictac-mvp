import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'https://tictictac-mvp-production.up.railway.app/api/participantes'

const AREAS = ['Política', 'Político', 'Tecnologia', 'Educação', 'Saúde', 'Meio Ambiente', 'Economia', 'Cultura', 'Direitos Humanos', 'Outro']
const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const REGIOES: Record<string, string> = {
  AC:'Norte',AM:'Norte',AP:'Norte',PA:'Norte',RO:'Norte',RR:'Norte',TO:'Norte',
  AL:'Nordeste',BA:'Nordeste',CE:'Nordeste',MA:'Nordeste',PB:'Nordeste',PE:'Nordeste',PI:'Nordeste',RN:'Nordeste',SE:'Nordeste',
  DF:'Centro-Oeste',GO:'Centro-Oeste',MS:'Centro-Oeste',MT:'Centro-Oeste',
  ES:'Sudeste',MG:'Sudeste',RJ:'Sudeste',SP:'Sudeste',
  PR:'Sul',RS:'Sul',SC:'Sul'
}

const VAZIO = { nome:'', cargo:'', email:'', telefone:'', area:'Política', estado:'SP', expInternacional: false }

export default function App() {
  const [participantes, setParticipantes] = useState<any[]>([])
  const [tela, setTela] = useState<'painel'|'lista'|'novo'|'editar'>('painel')
  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [form, setForm] = useState<any>(VAZIO)
  const [editando, setEditando] = useState<any>(null)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try {
      const r = await axios.get(API)
      setParticipantes(r.data)
    } catch { setMsg('Erro ao carregar participantes.') }
  }

  async function salvar() {
    if (!form.nome || !form.email) { setMsg('Nome e email são obrigatórios.'); return }
    setSalvando(true)
    try {
      const dados = { ...form, regiao: REGIOES[form.estado] || '' }
      if (editando) {
        await axios.put(`${API}/${editando.id}`, dados)
        setMsg('Participante atualizado!')
      } else {
        await axios.post(API, dados)
        setMsg('Participante cadastrado!')
      }
      await carregar()
      setForm(VAZIO)
      setEditando(null)
      setTela('lista')
    } catch { setMsg('Erro ao salvar.') }
    setSalvando(false)
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este participante?')) return
    await axios.delete(`${API}/${id}`)
    setMsg('Participante excluído.')
    carregar()
  }

  function editarP(p: any) {
    setEditando(p)
    setForm({ nome:p.nome, cargo:p.cargo, email:p.email, telefone:p.telefone, area:p.area, estado:p.estado, expInternacional:p.expInternacional })
    setTela('editar')
  }

  function exportarCSV() {
    const cols = ['Nome','Cargo','Email','Telefone','Área','Estado','Região','Exp. Internacional']
    const linhas = filtrados.map(p => [p.nome,p.cargo,p.email,p.telefone,p.area,p.estado,p.regiao,p.expInternacional?'Sim':'Não'].join(';'))
    const csv = [cols.join(';'), ...linhas].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='participantes.csv'; a.click()
  }

  const filtrados = participantes.filter(p => {
    const ok1 = !busca || p.nome.toLowerCase().includes(busca.toLowerCase())
    const ok2 = !filtroArea || p.area === filtroArea
    const ok3 = !filtroEstado || p.estado === filtroEstado
    return ok1 && ok2 && ok3
  })

  const regioes = [...new Set(participantes.map(p => p.regiao).filter(Boolean))]
  const areas = [...new Set(participantes.map(p => p.area).filter(Boolean))]

  const s: Record<string,any> = {
    app: { fontFamily:"'Segoe UI',sans-serif", background:'#f0f2f5', minHeight:'100vh', display:'flex' },
    sidebar: { width:220, background:'#1a2332', color:'#fff', padding:'24px 0', display:'flex', flexDirection:'column', gap:4, minHeight:'100vh', flexShrink:0 },
    logo: { padding:'0 20px 24px', borderBottom:'1px solid #2d3f55' },
    logoTitle: { fontSize:20, fontWeight:700, color:'#fff', letterSpacing:1 },
    logoSub: { fontSize:11, color:'#7a9ab5', marginTop:2 },
    navSection: { padding:'16px 20px 4px', fontSize:10, color:'#4a6a8a', fontWeight:700, letterSpacing:1.5, textTransform:'uppercase' },
    navItem: (ativo:boolean) => ({ padding:'10px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:13, color: ativo?'#fff':'#8aaccc', background: ativo?'#2d4a6a':'transparent', borderLeft: ativo?'3px solid #4a9eff':'3px solid transparent', transition:'all 0.15s' }),
    main: { flex:1, padding:28, overflowY:'auto' as const },
    header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
    title: { fontSize:22, fontWeight:700, color:'#1a2332' },
    badge: { background:'#e8f0fe', color:'#1a73e8', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 },
    cards: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
    card: { background:'#fff', borderRadius:12, padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
    cardNum: { fontSize:32, fontWeight:700, color:'#1a2332' },
    cardLabel: { fontSize:12, color:'#666', marginTop:4 },
    grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 },
    box: { background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
    boxTitle: { fontSize:13, fontWeight:700, color:'#1a2332', marginBottom:16 },
    dotRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', fontSize:13, color:'#444', borderBottom:'1px solid #f0f0f0' },
    dot: { width:8, height:8, borderRadius:'50%', background:'#1a73e8', display:'inline-block', marginRight:8 },
    table: { width:'100%', borderCollapse:'collapse' as const },
    th: { textAlign:'left' as const, padding:'10px 14px', fontSize:11, color:'#888', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:0.5, borderBottom:'2px solid #f0f0f0' },
    td: { padding:'12px 14px', fontSize:13, color:'#333', borderBottom:'1px solid #f7f7f7' },
    chip: (color:string) => ({ background:color+'20', color:color, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600 }),
    btn: { background:'#1a73e8', color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 },
    btnSm: (color:string) => ({ background:color, color:'#fff', border:'none', padding:'5px 12px', borderRadius:6, cursor:'pointer', fontSize:12, marginRight:6 }),
    btnOut: { background:'#fff', color:'#1a73e8', border:'1px solid #1a73e8', padding:'9px 18px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 },
    input: { width:'100%', padding:'10px 14px', border:'1px solid #ddd', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box' as const, marginTop:6 },
    label: { fontSize:12, fontWeight:600, color:'#555' },
    formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
    msgBox: { background:'#e8f5e9', color:'#2e7d32', padding:'10px 16px', borderRadius:8, marginBottom:16, fontSize:13 },
    searchRow: { display:'flex', gap:12, marginBottom:20, alignItems:'center' },
  }

  const areaColor = (a:string) => ({Política:'#1a73e8',Político:'#9c27b0',Tecnologia:'#00897b',Educação:'#f57c00',Saúde:'#e53935',Outro:'#607d8b'}[a] || '#607d8b')

  return (
    <div style={s.app}>
      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoTitle}>TIC TIC TAC</div>
          <div style={s.logoSub}>Gestão de participantes</div>
          <div style={{...s.logoSub, marginTop:2}}>Projeto Brasil — impacto global</div>
        </div>
        <div style={s.navSection}>Visão geral</div>
        <div style={s.navItem(tela==='painel')} onClick={()=>setTela('painel')}>📊 Painel</div>
        <div style={s.navSection}>Participantes</div>
        <div style={s.navItem(tela==='lista')} onClick={()=>setTela('lista')}>👥 Todos os participantes</div>
        <div style={s.navItem(tela==='novo'||tela==='editar')} onClick={()=>{setForm(VAZIO);setEditando(null);setTela('novo')}}>➕ Novo cadastro</div>
        <div style={s.navSection}>Ferramentas</div>
        <div style={s.navItem(false)} onClick={()=>{setTela('lista')}}>🔍 Filtros avançados</div>
        <div style={s.navItem(false)} onClick={exportarCSV}>⬇️ Exportar CSV</div>
      </div>

      {/* MAIN */}
      <div style={s.main}>
        {msg && <div style={s.msgBox}>{msg} <span style={{float:'right',cursor:'pointer'}} onClick={()=>setMsg('')}>✕</span></div>}

        {/* PAINEL */}
        {tela==='painel' && (
          <>
            <div style={s.header}>
              <div style={s.title}>Painel geral</div>
              <div style={s.badge}>👥 {participantes.length} participantes</div>
            </div>
            <div style={s.cards}>
              {[
                {n:participantes.length, l:'Total de participantes'},
                {n:participantes.filter(p=>p.expInternacional).length, l:'Exp. internacional'},
                {n:[...new Set(participantes.map(p=>p.estado))].length, l:'Estados representados'},
                {n:areas.length, l:'Áreas temáticas'},
              ].map((c,i)=>(
                <div key={i} style={s.card}>
                  <div style={s.cardNum}>{c.n}</div>
                  <div style={s.cardLabel}>{c.l}</div>
                </div>
              ))}
            </div>
            <div style={s.grid2}>
              <div style={s.box}>
                <div style={s.boxTitle}>ÁREA TEMÁTICA DE ATUAÇÃO</div>
                {areas.map(a => (
                  <div key={a} style={s.dotRow}>
                    <span><span style={s.dot}/>  {a}</span>
                    <span>{participantes.filter(p=>p.area===a).length}</span>
                  </div>
                ))}
              </div>
              <div style={s.box}>
                <div style={s.boxTitle}>DISTRIBUIÇÃO POR REGIÃO</div>
                {regioes.map(r => (
                  <div key={r} style={s.dotRow}>
                    <span><span style={s.dot}/> {r}</span>
                    <span>{participantes.filter(p=>p.regiao===r).length}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.box}>
              <div style={s.boxTitle}>🕐 Cadastros recentes</div>
              <table style={s.table}>
                <thead><tr>
                  {['Nome','Cargo','Área Temática','Estado','Exp. Intl.'].map(h=><th key={h} style={s.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {participantes.slice(-5).reverse().map(p=>(
                    <tr key={p.id}>
                      <td style={{...s.td, fontWeight:600}}>{p.nome}</td>
                      <td style={s.td}>{p.cargo}</td>
                      <td style={s.td}><span style={s.chip(areaColor(p.area))}>{p.area}</span></td>
                      <td style={s.td}>{p.estado}</td>
                      <td style={s.td}><span style={s.chip(p.expInternacional?'#2e7d32':'#888')}>{p.expInternacional?'Sim':'Não'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* LISTA */}
        {tela==='lista' && (
          <>
            <div style={s.header}>
              <div style={s.title}>Todos os participantes</div>
              <div style={{display:'flex',gap:10}}>
                <button style={s.btnOut} onClick={exportarCSV}>⬇️ Exportar CSV</button>
                <button style={s.btn} onClick={()=>{setForm(VAZIO);setEditando(null);setTela('novo')}}>+ Novo cadastro</button>
              </div>
            </div>
            <div style={s.searchRow}>
              <input style={{...s.input, marginTop:0, maxWidth:280}} placeholder="🔍 Buscar por nome..." value={busca} onChange={e=>setBusca(e.target.value)}/>
              <select style={{...s.input, marginTop:0, width:160}} value={filtroArea} onChange={e=>setFiltroArea(e.target.value)}>
                <option value="">Todas as áreas</option>
                {AREAS.map(a=><option key={a}>{a}</option>)}
              </select>
              <select style={{...s.input, marginTop:0, width:120}} value={filtroEstado} onChange={e=>setFiltroEstado(e.target.value)}>
                <option value="">Todos estados</option>
                {ESTADOS.map(e=><option key={e}>{e}</option>)}
              </select>
              {(busca||filtroArea||filtroEstado) && <button style={{...s.btnOut, padding:'9px 14px'}} onClick={()=>{setBusca('');setFiltroArea('');setFiltroEstado('')}}>✕ Limpar</button>}
            </div>
            <div style={s.box}>
              <table style={s.table}>
                <thead><tr>
                  {['Nome','Cargo','Área','Estado','Região','Exp. Intl.','Ações'].map(h=><th key={h} style={s.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filtrados.length===0 && <tr><td colSpan={7} style={{...s.td, textAlign:'center', color:'#aaa'}}>Nenhum participante encontrado.</td></tr>}
                  {filtrados.map(p=>(
                    <tr key={p.id}>
                      <td style={{...s.td, fontWeight:600}}>{p.nome}</td>
                      <td style={s.td}>{p.cargo}</td>
                      <td style={s.td}><span style={s.chip(areaColor(p.area))}>{p.area}</span></td>
                      <td style={s.td}>{p.estado}</td>
                      <td style={s.td}>{p.regiao}</td>
                      <td style={s.td}><span style={s.chip(p.expInternacional?'#2e7d32':'#888')}>{p.expInternacional?'Sim':'Não'}</span></td>
                      <td style={s.td}>
                        <button style={s.btnSm('#1a73e8')} onClick={()=>editarP(p)}>✏️ Editar</button>
                        <button style={s.btnSm('#e53935')} onClick={()=>deletar(p.id)}>🗑️ Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* FORMULÁRIO */}
        {(tela==='novo'||tela==='editar') && (
          <>
            <div style={s.header}>
              <div style={s.title}>{editando ? 'Editar participante' : 'Novo cadastro'}</div>
              <button style={s.btnOut} onClick={()=>setTela('lista')}>← Voltar</button>
            </div>
            <div style={s.box}>
              <div style={s.formGrid}>
                {[
                  {l:'Nome completo *', k:'nome', t:'text', ph:'Ex: Maria Silva'},
                  {l:'Cargo / Função', k:'cargo', t:'text', ph:'Ex: Diretora Executiva'},
                  {l:'Email *', k:'email', t:'email', ph:'Ex: maria@email.com'},
                  {l:'Telefone', k:'telefone', t:'text', ph:'Ex: (11) 99999-9999'},
                ].map(f=>(
                  <div key={f.k}>
                    <label style={s.label}>{f.l}</label>
                    <input style={s.input} type={f.t} placeholder={f.ph} value={form[f.k]||''} onChange={e=>setForm({...form,[f.k]:e.target.value})}/>
                  </div>
                ))}
                <div>
                  <label style={s.label}>Área temática</label>
                  <select style={s.input} value={form.area} onChange={e=>setForm({...form,area:e.target.value})}>
                    {AREAS.map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Estado</label>
                  <select style={s.input} value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})}>
                    {ESTADOS.map(e=><option key={e}>{e}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:'1/-1', display:'flex', alignItems:'center', gap:10, marginTop:8}}>
                  <input type="checkbox" id="expInt" checked={form.expInternacional||false} onChange={e=>setForm({...form,expInternacional:e.target.checked})} style={{width:18,height:18,cursor:'pointer'}}/>
                  <label htmlFor="expInt" style={{...s.label, cursor:'pointer'}}>Possui experiência internacional</label>
                </div>
              </div>
              <div style={{marginTop:24, display:'flex', gap:12}}>
                <button style={s.btn} onClick={salvar} disabled={salvando}>{salvando?'Salvando...': editando ? 'Salvar alterações' : 'Cadastrar participante'}</button>
                <button style={s.btnOut} onClick={()=>{setForm(VAZIO);setEditando(null);setTela('lista')}}>Cancelar</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
