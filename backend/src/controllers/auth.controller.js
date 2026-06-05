const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'tictictac_secret_2024'

let admins = [
  { id: '1', nome: 'Administrador', email: 'admin@tictictac.com', senha: bcrypt.hashSync('admin123', 10), role: 'admin' }
]

exports.login = async (req, res) => {
  const { email, senha } = req.body
  const admin = admins.find(a => a.email === email)
  if (!admin) return res.status(401).json({ erro: 'Email ou senha inválidos' })
  const ok = await bcrypt.compare(senha, admin.senha)
  if (!ok) return res.status(401).json({ erro: 'Email ou senha inválidos' })
  const token = jwt.sign({ id: admin.id, nome: admin.nome, email: admin.email, role: admin.role }, SECRET, { expiresIn: '8h' })
  res.json({ token, admin: { id: admin.id, nome: admin.nome, email: admin.email } })
}

exports.listarAdmins = (req, res) => {
  res.json(admins.map(a => ({ id: a.id, nome: a.nome, email: a.email, role: a.role })))
}

exports.criarAdmin = async (req, res) => {
  const { nome, email, senha } = req.body
  if (admins.find(a => a.email === email)) return res.status(400).json({ erro: 'Email já cadastrado' })
  const hash = await bcrypt.hash(senha, 10)
  const novo = { id: Date.now().toString(), nome, email, senha: hash, role: 'admin' }
  admins.push(novo)
  res.status(201).json({ id: novo.id, nome: novo.nome, email: novo.email })
}

exports.deletarAdmin = (req, res) => {
  const { id } = req.params
  if (admins.length === 1) return res.status(400).json({ erro: 'Não é possível remover o único administrador' })
  admins = admins.filter(a => a.id !== id)
  res.status(204).send()
}

exports.verificarToken = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ erro: 'Token não fornecido' })
  try {
    const token = auth.split(' ')[1]
    req.admin = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' })
  }
}
