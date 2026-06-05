const { v4: uuid } = require('uuid')
const { enviarBoasVindas } = require('./email')

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(cpf[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(cpf[10])
}

let participantes = [
  { id: uuid(), nome: 'Camila Rocha', cargo: 'CEO & Fundadora', email: 'camila@email.com', telefone: '(11) 99999-0001', cpf: '123.456.789-09', area: 'Tecnologia', estado: 'SP', regiao: 'Sudeste', expInternacional: true, foto: null, dataCadastro: new Date().toISOString() },
  { id: uuid(), nome: 'Rafael Mendonça', cargo: 'Assessor Parlamentar', email: 'rafael@email.com', telefone: '(61) 99999-0002', cpf: '987.654.321-00', area: 'Político', estado: 'DF', regiao: 'Centro-Oeste', expInternacional: true, foto: null, dataCadastro: new Date().toISOString() },
  { id: uuid(), nome: 'Beatriz Tavares', cargo: 'Pesquisadora de Políticas Públicas', email: 'bea@email.com', telefone: '(92) 99999-0003', cpf: '111.222.333-96', area: 'Política', estado: 'AM', regiao: 'Norte', expInternacional: true, foto: null, dataCadastro: new Date().toISOString() }
]

exports.listar = (req, res) => res.json(participantes)

exports.criar = async (req, res) => {
  const { cpf } = req.body
  if (cpf && !validarCPF(cpf)) return res.status(400).json({ erro: 'CPF inválido' })
  const foto = req.file ? `/uploads/${req.file.filename}` : null
  const novo = { id: uuid(), ...req.body, foto, dataCadastro: new Date().toISOString() }
  participantes.push(novo)
  enviarBoasVindas(novo)
  res.status(201).json(novo)
}

exports.atualizar = (req, res) => {
  const { id } = req.params
  const index = participantes.findIndex(p => p.id === id)
  if (index === -1) return res.status(404).json({ erro: 'Não encontrado' })
  const foto = req.file ? `/uploads/${req.file.filename}` : participantes[index].foto
  participantes[index] = { ...participantes[index], ...req.body, foto }
  res.json(participantes[index])
}

exports.deletar = (req, res) => {
  const { id } = req.params
  const index = participantes.findIndex(p => p.id === id)
  if (index === -1) return res.status(404).json({ erro: 'Não encontrado' })
  participantes.splice(index, 1)
  res.status(204).send()
}
