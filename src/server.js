const express = require('express')
const path = require('path')
const participantesRoutes = require('./routes/participantes.routes')
const authRoutes = require('./routes/auth.routes')

const app = express()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/api/auth', authRoutes)
app.use('/api/participantes', participantesRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})