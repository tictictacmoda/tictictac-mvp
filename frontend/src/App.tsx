import { useEffect, useState } from 'react'
import axios from 'axios'

const API = ''

const AREAS = ['Política','Político','Tecnologia','Educação','Saúde','Meio Ambiente','Economia','Cultura','Direitos Humanos','Outro']
const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const REGIOES: Record<string,string> = {
  AC:'Norte',AM:'Norte',AP:'Norte',PA:'Norte',RO:'Norte',RR:'Norte',TO:'Norte',
  AL:'Nordeste',BA:'Nordeste',CE:'Nordeste',MA:'Nordeste',PB:'Nordeste',PE:'Nordeste',PI:'Nordeste',RN:'Nordeste',SE:'Nordeste',
  DF:'Centro-Oeste',GO:'Centro-Oeste',MS:'Centro-Oeste',MT:'Centro-Oeste',
  ES:'Sudeste',MG:'Sudeste',RJ:'Sudeste',SP:'Sudeste',
  PR:'Sul',RS:'Sul',SC:'Sul'
}
const AREA_COLORS: Record<string,string> = {Política:'#1a73e8',Político:'#9c27b0',Tecnologia:'#00897b',Educação:'#f57c00',Saúde:'#e53935','Meio Ambiente':'#388e3c',Economia:'#f9a825',Cultura:'#e91e63','Direitos Humanos':'#5c6bc0',Outro:'#607d8b'}
const VAZIO = {nome:'',cargo:'',email:'',telefone:'',cpf:'',area:'Política',estado:'SP',expInternacional:false}

function formatCPF(v: string) {
  return v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2')
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('tttoken')||'')
  const [adminNome, setAdminNome] = useState(localStorage.getItem('ttnome')||'')
  const [loginForm, setLoginForm] = useState({email:'admin@tictictac.com',senha:''})
  const [loginErro, setLoginErro] = useState('')
  const [participantes, setParticipantes] = useState<any[]>([])
  const [admins, setAdmins] = useState<any[]>([])
  const [tela, setTela] = useState<'painel'|'lista'|'novo'|'editar'|'equipe'>('painel')
  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [form, setForm] = useState<any>(VAZIO)
  const [fotoFile, setFotoFile] = useState<File|null>(null)
  const [fotoPreview, setFotoPreview] = useState<string>('')
  const [editando, setEditando] = useState<any>(null)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgTipo, setMsgTipo] = useState<'ok'|'err'>('ok')
  const [novoAdmin, setNovoAdmin] = useState({nome:'',email:'',senha:''})

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { if (token) { carregar(); carregarAdmins() } }, [token])

  async function login() {
    setLoginErro('')
    try {
      const r = await axios.post(`${API}/api/auth/login`, loginForm)
      setToken(r.data.token)
      setAdminNome(r.data.admin.nome)
      localStorage.setItem('tttoken', r.data.token)
      localStorage.setItem('ttnome', r.data.admin.nome)
    } catch { setLoginErro('Email ou senha inválidos') }
  }

  function logout() {
    setToken(''); setAdminNome('')
    localStorage.removeItem('tttoken'); localStorage.removeItem('ttnome')
  }

  async function carregar() {
    try { const r = await axios.get(`${API}/api/participantes`, {headers}); setParticipantes(r.data) }
    catch { mostrarMsg('Sessão expirada. Faça login novamente.','err'); logout() }
  }

  async function carregarAdmins() {
    try { const r = await axios.get(`${API}/api/auth/admins`, {headers}); setAdmins(r.data) } catch {}
  }

  function mostrarMsg(m: string, tipo: 'ok'|'err' = 'ok') { setMsg(m); setMsgTipo(tipo); setTimeout(()=>setMsg(''),4000) }

  async function salvar() {
    if (!form.nome || !form.email) { mostrarMsg('Nome e email são obrigatórios.','err'); return }
    setSalvando(true)
    try {
      const fd = new FormData()
      Object.entries({...form, regiao: REGIOES[form.estado]||''}).forEach(([k,v]) => fd.append(k, String(v)))
      if (fotoFile) fd.append('foto', fotoFile)
      if (editando) {
        await axios.put(`${API}/api/participantes/${editando.id}`, fd, {headers})
        mostrarMsg('Participante atualizado!')
      } else {
        await axios.post(`${API}/api/participantes`, fd, {headers})
        mostrarMsg('Participante cadastrado! Email de boas-vindas enviado.')
      }
      await carregar(); setForm(VAZIO); setFotoFile(null); setFotoPreview(''); setEditando(null); setTela('lista')
    } catch(e: any) { mostrarMsg(e.response?.data?.erro || 'Erro ao salvar.','err') }
    setSalvando(false)
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este participante?')) return
    await axios.delete(`${API}/api/participantes/${id}`, {headers})
    mostrarMsg('Participante excluído.'); carregar()
  }

  function editarP(p: any) {
    setEditando(p)
    setForm({nome:p.nome,cargo:p.cargo||'',email:p.email,telefone:p.telefone||'',cpf:p.cpf||'',area:p.area,estado:p.estado,expInternacional:p.expInternacional})
    setFotoPreview(p.foto ? `${API}${p.foto}` : '')
    setFotoFile(null); setTela('editar')
  }

  async function adicionarAdmin() {
    if (!novoAdmin.nome||!novoAdmin.email||!novoAdmin.senha) { mostrarMsg('Preencha todos os campos do admin.','err'); return }
    try {
      await axios.post(`${API}/api/auth/admins`, novoAdmin, {headers})
      mostrarMsg('Admin adicionado!'); setNovoAdmin({nome:'',email:'',senha:''}); carregarAdmins()
    } catch(e: any) { mostrarMsg(e.response?.data?.erro||'Erro ao adicionar admin','err') }
  }

  async function removerAdmin(id: string) {
    if (!confirm('Remover este administrador?')) return
    try { await axios.delete(`${API}/api/auth/admins/${id}`, {headers}); carregarAdmins(); mostrarMsg('Admin removido.') }
    catch(e: any) { mostrarMsg(e.response?.data?.erro||'Erro','err') }
  }

  function exportarCSV() {
    const cols = ['Nome','Cargo','Email','Telefone','CPF','Área','Estado','Região','Exp. Internacional']
    const linhas = filtrados.map(p=>[p.nome,p.cargo,p.email,p.telefone,p.cpf,p.area,p.estado,p.regiao,p.expInternacional?'Sim':'Não'].join(';'))
    const csv = [cols.join(';'),...linhas].join('\n')
    const blob = new Blob([csv],{type:'text/csv'}); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='participantes.csv'; a.click()
  }

  const filtrados = participantes.filter(p => {
    return (!busca||p.nome.toLowerCase().includes(busca.toLowerCase())) &&
           (!filtroArea||p.area===filtroArea) && (!filtroEstado||p.estado===filtroEstado)
  })

  // Dados para gráficos
  const porArea = AREAS.map(a=>({area:a,n:(participantes||[]).filter(p=>p.area===a).length})).filter(x=>x.n>0)
  const porRegiao = [...new Set((participantes||[]).map(p=>p.regiao).filter(Boolean))].map(r=>({regiao:r,n:(participantes||[]).filter(p=>p.regiao===r).length}))
  const maxArea = porArea.length > 0 ? Math.max(...porArea.map(x=>x.n),1) : 1

  const s: Record<string,any> = {
    app: {fontFamily:"'Segoe UI',sans-serif",background:'#f0f2f5',minHeight:'100vh',display:'flex'},
    sidebar: {width:220,background:'#1a2332',color:'#fff',padding:'24px 0',display:'flex',flexDirection:'column',gap:4,minHeight:'100vh',flexShrink:0},
    logo: {padding:'0 20px 24px',borderBottom:'1px solid #2d3f55'},
    logoTitle: {fontSize:20,fontWeight:700,color:'#fff',letterSpacing:1},
    logoSub: {fontSize:11,color:'#7a9ab5',marginTop:2},
    navSection: {padding:'16px 20px 4px',fontSize:10,color:'#4a6a8a',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase'},
    navItem: (a:boolean)=>({padding:'10px 20px',cursor:'pointer',display:'flex',alignItems:'center',gap:10,fontSize:13,color:a?'#fff':'#8aaccc',background:a?'#2d4a6a':'transparent',borderLeft:a?'3px solid #4a9eff':'3px solid transparent',transition:'all 0.15s'}),
    main: {flex:1,padding:28,overflowY:'auto' as const},
    header: {display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24},
    title: {fontSize:22,fontWeight:700,color:'#1a2332'},
    badge: {background:'#e8f0fe',color:'#1a73e8',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600},
    cards: {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24},
    card: {background:'#fff',borderRadius:12,padding:'20px 24px',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'},
    cardNum: {fontSize:32,fontWeight:700,color:'#1a2332'},
    cardLabel: {fontSize:12,color:'#666',marginTop:4},
    grid2: {display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24},
    box: {background:'#fff',borderRadius:12,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',marginBottom:16},
    boxTitle: {fontSize:13,fontWeight:700,color:'#1a2332',marginBottom:16},
    table: {width:'100%',borderCollapse:'collapse' as const},
    th: {textAlign:'left' as const,padding:'10px 14px',fontSize:11,color:'#888',fontWeight:700,textTransform:'uppercase' as const,letterSpacing:0.5,borderBottom:'2px solid #f0f0f0'},
    td: {padding:'12px 14px',fontSize:13,color:'#333',borderBottom:'1px solid #f7f7f7'},
    chip: (c:string)=>({background:c+'20',color:c,padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:600,display:'inline-block'}),
    btn: {background:'#1a73e8',color:'#fff',border:'none',padding:'10px 20px',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600},
    btnSm: (c:string)=>({background:c,color:'#fff',border:'none',padding:'5px 12px',borderRadius:6,cursor:'pointer',fontSize:12,marginRight:6}),
    btnOut: {background:'#fff',color:'#1a73e8',border:'1px solid #1a73e8',padding:'9px 18px',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600},
    btnRed: {background:'#fff',color:'#e53935',border:'1px solid #e53935',padding:'9px 18px',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600},
    input: {width:'100%',padding:'10px 14px',border:'1px solid #ddd',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const,marginTop:6},
    label: {fontSize:12,fontWeight:600,color:'#555'},
    formGrid: {display:'grid',gridTemplateColumns:'1fr 1fr',gap:16},
    msgBox: (t:'ok'|'err')=>({background:t==='ok'?'#e8f5e9':'#ffebee',color:t==='ok'?'#2e7d32':'#c62828',padding:'10px 16px',borderRadius:8,marginBottom:16,fontSize:13,display:'flex',justifyContent:'space-between'}),
    searchRow: {display:'flex',gap:12,marginBottom:20,alignItems:'center',flexWrap:'wrap' as const},
    avatar: {width:36,height:36,borderRadius:'50%',objectFit:'cover' as const,border:'2px solid #e0e0e0'},
    avatarPlaceholder: {width:36,height:36,borderRadius:'50%',background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#1a73e8'},
  }

  // TELA DE LOGIN
  if (!token) return (
    <div style={{minHeight:'100vh',background:'#1a2332',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{background:'#fff',borderRadius:16,padding:40,width:360,boxShadow:'0 8px 32px rgba(0,0,0,0.3)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:24,fontWeight:700,color:'#1a2332',letterSpacing:1}}>TIC TIC TAC</div>
          <div style={{fontSize:12,color:'#888',marginTop:4}}>Projeto Brasil — Impacto Global</div>
        </div>
        {loginErro && <div style={{background:'#ffebee',color:'#c62828',padding:'10px 14px',borderRadius:8,marginBottom:16,fontSize:13}}>{loginErro}</div>}
        <div style={{marginBottom:16}}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} placeholder="admin@tictictac.com"/>
        </div>
        <div style={{marginBottom:24}}>
          <label style={s.label}>Senha</label>
          <input style={s.input} type="password" value={loginForm.senha} onChange={e=>setLoginForm({...loginForm,senha:e.target.value})} onKeyDown={e=>e.key==='Enter'&&login()} placeholder="••••••••"/>
        </div>
        <button style={{...s.btn,width:'100%',padding:'12px'}} onClick={login}>Entrar</button>
        <div style={{marginTop:16,fontSize:11,color:'#aaa',textAlign:'center'}}>Senha padrão: admin123</div>
      </div>
    </div>
  )

  return (
    <div style={s.app}>
      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoTitle}>TIC TIC TAC</div>
          <div style={s.logoSub}>Gestão de participantes</div>
          <div style={{...s.logoSub,marginTop:2}}>Projeto Brasil — impacto global</div>
        </div>
        <div style={s.navSection}>Visão geral</div>
        <div style={s.navItem(tela==='painel')} onClick={()=>setTela('painel')}>📊 Painel</div>
        <div style={s.navSection}>Participantes</div>
        <div style={s.navItem(tela==='lista')} onClick={()=>setTela('lista')}>👥 Todos os participantes</div>
        <div style={s.navItem(tela==='novo'||tela==='editar')} onClick={()=>{setForm(VAZIO);setEditando(null);setFotoFile(null);setFotoPreview('');setTela('novo')}}>➕ Novo cadastro</div>
        <div style={s.navSection}>Ferramentas</div>
        <div style={s.navItem(false)} onClick={exportarCSV}>⬇️ Exportar CSV</div>
        <div style={s.navItem(tela==='equipe')} onClick={()=>{carregarAdmins();setTela('equipe')}}>👤 Equipe / Admins</div>
        <div style={{marginTop:'auto',padding:'16px 20px',borderTop:'1px solid #2d3f55'}}>
          <div style={{fontSize:12,color:'#7a9ab5',marginBottom:8}}>Logado como:</div>
          <div style={{fontSize:13,color:'#fff',fontWeight:600}}>{adminNome}</div>
          <div style={{marginTop:10,cursor:'pointer',fontSize:12,color:'#e57373'}} onClick={logout}>🚪 Sair</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={s.main}>
        {msg && <div style={s.msgBox(msgTipo)}><span>{msg}</span><span style={{cursor:'pointer'}} onClick={()=>setMsg('')}>✕</span></div>}

        {/* PAINEL */}
        {tela==='painel' && (<>
          <div style={s.header}>
            <div style={s.title}>Painel geral</div>
            <div style={s.badge}>👥 {participantes.length} participantes</div>
          </div>
          <div style={s.cards}>
            {[
              {n:participantes.length,l:'Total de participantes',i:'👥'},
              {n:participantes.filter(p=>p.expInternacional).length,l:'Exp. internacional',i:'🌍'},
              {n:[...new Set(participantes.map(p=>p.estado))].length,l:'Estados representados',i:'📍'},
              {n:[...new Set(participantes.map(p=>p.area))].length,l:'Áreas temáticas',i:'🏷️'},
            ].map((c,i)=>(
              <div key={i} style={s.card}>
                <div style={{fontSize:24,marginBottom:8}}>{c.i}</div>
                <div style={s.cardNum}>{c.n}</div>
                <div style={s.cardLabel}>{c.l}</div>
              </div>
            ))}
          </div>

          {/* GRÁFICO DE BARRAS - ÁREAS */}
          <div style={{...s.box,marginBottom:16}}>
            <div style={s.boxTitle}>📊 DISTRIBUIÇÃO POR ÁREA TEMÁTICA</div>
            {porArea.map(({area,n})=>(
              <div key={area} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:13}}>
                  <span style={{color:'#333'}}>{area}</span>
                  <span style={{fontWeight:700,color:AREA_COLORS[area]||'#607d8b'}}>{n}</span>
                </div>
                <div style={{background:'#f0f2f5',borderRadius:6,height:10,overflow:'hidden'}}>
                  <div style={{width:`${(n/maxArea)*100}%`,height:'100%',background:AREA_COLORS[area]||'#607d8b',borderRadius:6,transition:'width 0.5s'}}/>
                </div>
              </div>
            ))}
          </div>

          <div style={s.grid2}>
            {/* DISTRIBUIÇÃO POR REGIÃO */}
            <div style={s.box}>
              <div style={s.boxTitle}>🗺️ DISTRIBUIÇÃO POR REGIÃO</div>
              {porRegiao.map(({regiao,n})=>(
                <div key={regiao} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f0f0f0',fontSize:13}}>
                  <span style={{color:'#444'}}>● {regiao}</span>
                  <span style={{fontWeight:700,color:'#1a2332'}}>{n}</span>
                </div>
              ))}
            </div>
            {/* EXP INTERNACIONAL */}
            <div style={s.box}>
              <div style={s.boxTitle}>🌍 EXPERIÊNCIA INTERNACIONAL</div>
              {[{l:'Com experiência',v:true,c:'#2e7d32'},{l:'Sem experiência',v:false,c:'#888'}].map(({l,v,c})=>{
                const n = participantes.filter(p=>p.expInternacional===v).length
                const pct = participantes.length ? Math.round((n/participantes.length)*100) : 0
                return (
                  <div key={l} style={{marginBottom:16}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:13}}>
                      <span style={{color:'#333'}}>{l}</span><span style={{fontWeight:700,color:c}}>{n} ({pct}%)</span>
                    </div>
                    <div style={{background:'#f0f2f5',borderRadius:6,height:10,overflow:'hidden'}}>
                      <div style={{width:`${pct}%`,height:'100%',background:c,borderRadius:6,transition:'width 0.5s'}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CADASTROS RECENTES */}
          <div style={s.box}>
            <div style={s.boxTitle}>🕐 Cadastros recentes</div>
            <table style={s.table}>
              <thead><tr>{['','Nome','Cargo','Área','Estado','Exp. Intl.'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {participantes.slice(-5).reverse().map(p=>(
                  <tr key={p.id}>
                    <td style={{...s.td,width:50}}>
                      {p.foto ? <img src={`${API}${p.foto}`} style={s.avatar} alt="foto"/> : <div style={s.avatarPlaceholder}>{p.nome[0]}</div>}
                    </td>
                    <td style={{...s.td,fontWeight:600}}>{p.nome}</td>
                    <td style={s.td}>{p.cargo}</td>
                    <td style={s.td}><span style={s.chip(AREA_COLORS[p.area]||'#607d8b')}>{p.area}</span></td>
                    <td style={s.td}>{p.estado}</td>
                    <td style={s.td}><span style={s.chip(p.expInternacional?'#2e7d32':'#888')}>{p.expInternacional?'Sim':'Não'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}

        {/* LISTA */}
        {tela==='lista' && (<>
          <div style={s.header}>
            <div style={s.title}>Todos os participantes</div>
            <div style={{display:'flex',gap:10}}>
              <button style={s.btnOut} onClick={exportarCSV}>⬇️ Exportar CSV</button>
              <button style={s.btn} onClick={()=>{setForm(VAZIO);setEditando(null);setFotoFile(null);setFotoPreview('');setTela('novo')}}>+ Novo cadastro</button>
            </div>
          </div>
          <div style={s.searchRow}>
            <input style={{...s.input,marginTop:0,maxWidth:260}} placeholder="🔍 Buscar por nome..." value={busca} onChange={e=>setBusca(e.target.value)}/>
            <select style={{...s.input,marginTop:0,width:160}} value={filtroArea} onChange={e=>setFiltroArea(e.target.value)}>
              <option value="">Todas as áreas</option>
              {AREAS.map(a=><option key={a}>{a}</option>)}
            </select>
            <select style={{...s.input,marginTop:0,width:120}} value={filtroEstado} onChange={e=>setFiltroEstado(e.target.value)}>
              <option value="">Todos estados</option>
              {ESTADOS.map(e=><option key={e}>{e}</option>)}
            </select>
            {(busca||filtroArea||filtroEstado)&&<button style={{...s.btnOut,padding:'9px 14px'}} onClick={()=>{setBusca('');setFiltroArea('');setFiltroEstado('')}}>✕ Limpar</button>}
          </div>
          <div style={s.box}>
            <div style={{fontSize:12,color:'#888',marginBottom:12}}>{filtrados.length} participante(s) encontrado(s)</div>
            <table style={s.table}>
              <thead><tr>{['','Nome','Cargo','CPF','Área','Estado','Exp. Intl.','Ações'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtrados.length===0&&<tr><td colSpan={8} style={{...s.td,textAlign:'center',color:'#aaa'}}>Nenhum participante encontrado.</td></tr>}
                {filtrados.map(p=>(
                  <tr key={p.id}>
                    <td style={{...s.td,width:50}}>
                      {p.foto?<img src={`${API}${p.foto}`} style={s.avatar} alt="foto"/>:<div style={s.avatarPlaceholder}>{p.nome[0]}</div>}
                    </td>
                    <td style={{...s.td,fontWeight:600}}>{p.nome}</td>
                    <td style={s.td}>{p.cargo}</td>
                    <td style={{...s.td,fontFamily:'monospace',fontSize:12}}>{p.cpf||'—'}</td>
                    <td style={s.td}><span style={s.chip(AREA_COLORS[p.area]||'#607d8b')}>{p.area}</span></td>
                    <td style={s.td}>{p.estado}</td>
                    <td style={s.td}><span style={s.chip(p.expInternacional?'#2e7d32':'#888')}>{p.expInternacional?'Sim':'Não'}</span></td>
                    <td style={s.td}>
                      <button style={s.btnSm('#1a73e8')} onClick={()=>editarP(p)}>✏️</button>
                      <button style={s.btnSm('#e53935')} onClick={()=>deletar(p.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}

        {/* FORMULÁRIO */}
        {(tela==='novo'||tela==='editar')&&(<>
          <div style={s.header}>
            <div style={s.title}>{editando?'Editar participante':'Novo cadastro'}</div>
            <button style={s.btnOut} onClick={()=>setTela('lista')}>← Voltar</button>
          </div>
          <div style={s.box}>
            {/* FOTO */}
            <div style={{marginBottom:24,display:'flex',alignItems:'center',gap:20}}>
              <div style={{width:80,height:80,borderRadius:'50%',overflow:'hidden',border:'3px solid #e0e0e0',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f2f5',flexShrink:0}}>
                {fotoPreview?<img src={fotoPreview} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="preview"/>:<span style={{fontSize:32}}>👤</span>}
              </div>
              <div>
                <label style={s.label}>Foto do participante</label>
                <input type="file" accept="image/*" style={{display:'block',marginTop:8,fontSize:13}} onChange={e=>{const f=e.target.files?.[0];if(f){setFotoFile(f);setFotoPreview(URL.createObjectURL(f))}}}/>
                <div style={{fontSize:11,color:'#aaa',marginTop:4}}>JPG, PNG até 5MB</div>
              </div>
            </div>
            <div style={s.formGrid}>
              {[
                {l:'Nome completo *',k:'nome',t:'text',ph:'Ex: Maria Silva'},
                {l:'Cargo / Função',k:'cargo',t:'text',ph:'Ex: Diretora Executiva'},
                {l:'Email *',k:'email',t:'email',ph:'Ex: maria@email.com'},
                {l:'Telefone',k:'telefone',t:'text',ph:'Ex: (11) 99999-9999'},
                {l:'CPF',k:'cpf',t:'text',ph:'Ex: 000.000.000-00'},
              ].map(f=>(
                <div key={f.k}>
                  <label style={s.label}>{f.l}</label>
                  <input style={s.input} type={f.t} placeholder={f.ph} value={form[f.k]||''} onChange={e=>setForm({...form,[f.k]:f.k==='cpf'?formatCPF(e.target.value):e.target.value})}/>
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
              <div style={{gridColumn:'1/-1',display:'flex',alignItems:'center',gap:10,marginTop:8}}>
                <input type="checkbox" id="expInt" checked={form.expInternacional||false} onChange={e=>setForm({...form,expInternacional:e.target.checked})} style={{width:18,height:18,cursor:'pointer'}}/>
                <label htmlFor="expInt" style={{...s.label,cursor:'pointer'}}>Possui experiência internacional</label>
              </div>
            </div>
            <div style={{marginTop:24,display:'flex',gap:12}}>
              <button style={s.btn} onClick={salvar} disabled={salvando}>{salvando?'Salvando...':(editando?'Salvar alterações':'Cadastrar participante')}</button>
              <button style={s.btnOut} onClick={()=>{setForm(VAZIO);setEditando(null);setFotoFile(null);setFotoPreview('');setTela('lista')}}>Cancelar</button>
            </div>
          </div>
        </>)}

        {/* EQUIPE */}
        {tela==='equipe'&&(<>
          <div style={s.header}>
            <div style={s.title}>👤 Equipe / Administradores</div>
          </div>
          <div style={s.box}>
            <div style={s.boxTitle}>Administradores cadastrados</div>
            <table style={s.table}>
              <thead><tr>{['Nome','Email','Ação'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {admins.map(a=>(
                  <tr key={a.id}>
                    <td style={{...s.td,fontWeight:600}}>{a.nome}</td>
                    <td style={s.td}>{a.email}</td>
                    <td style={s.td}><button style={s.btnSm('#e53935')} onClick={()=>removerAdmin(a.id)}>🗑️ Remover</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={s.box}>
            <div style={s.boxTitle}>Adicionar novo administrador</div>
            <div style={s.formGrid}>
              {[{l:'Nome',k:'nome',t:'text'},{l:'Email',k:'email',t:'email'},{l:'Senha inicial',k:'senha',t:'password'}].map(f=>(
                <div key={f.k}>
                  <label style={s.label}>{f.l}</label>
                  <input style={s.input} type={f.t} value={(novoAdmin as any)[f.k]} onChange={e=>setNovoAdmin({...novoAdmin,[f.k]:e.target.value})}/>
                </div>
              ))}
            </div>
            <button style={{...s.btn,marginTop:16}} onClick={adicionarAdmin}>Adicionar administrador</button>
          </div>
        </>)}
      </div>
    </div>
  )
}