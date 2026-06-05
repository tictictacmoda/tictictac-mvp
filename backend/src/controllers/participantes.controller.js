
const { v4: uuid } = require('uuid')

let participantes = [
  {
    id: uuid(),
    nome: 'Beatriz Tavares',
    email: 'bea@gmail.com',
    area: 'Política'
  }
]

exports.listar = (req, res) => {
  res.json(participantes)
}

exports.criar = (req, res) => {
  const novo = {
    id: uuid(),
    ...req.body
  }

  participantes.push(novo)

  res.status(201).json(novo)
}
