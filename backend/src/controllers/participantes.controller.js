const { v4: uuid } = require('uuid')

let participantes = [
  {
    id: uuid(),
    nome: 'Camila Rocha',
    cargo: 'CEO & Fundadora',
    email: 'camila@email.com',
    telefone: '(11) 99999-0001',
    area: 'Tecnologia',
    estado: 'SP',
    regiao: 'Sudeste',
    expInternacional: true,
    dataCadastro: new Date().toISOString()
  },
  {
    id: uuid(),
    nome: 'Rafael Mendonça',
    cargo: 'Assessor Parlamentar',
    email: 'rafael@email.com',
    telefone: '(61) 99999-0002',
    area: 'Político',
    estado: 'DF',
    regiao: 'Centro-Oeste',
    expInternacional: true,
    dataCadastro: new Date().toISOString()
  },
  {
    id: uuid(),
    nome: 'Beatriz Tavares',
    cargo: 'Pesquisadora de Políticas Públicas',
    email: 'bea@email.com',
    telefone: '(92) 99999-0003',
    area: 'Política',
    estado: 'AM',
    regiao: 'Norte',
    expInternacional: true,
    dataCadastro: new Date().toISOString()
  }
]

exports.listar = (req, res) => {
  res.json(participantes)
}

exports.criar = (req, res) => {
  const novo = {
    id: uuid(),
    ...req.body,
    dataCadastro: new Date().toISOString()
  }
  participantes.push(novo)
  res.status(201).json(novo)
}

exports.atualizar = (req, res) => {
  const { id } = req.params
  const index = participantes.findIndex(p => p.id === id)
  if (index === -1) return res.status(404).json({ erro: 'Participante não encontrado' })
  participantes[index] = { ...participantes[index], ...req.body }
  res.json(participantes[index])
}

exports.deletar = (req, res) => {
  const { id } = req.params
  const index = participantes.findIndex(p => p.id === id)
  if (index === -1) return res.status(404).json({ erro: 'Participante não encontrado' })
  participantes.splice(index, 1)
  res.status(204).send()
}
