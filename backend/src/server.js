const express = require('express')
const path = require('path')
const participantesRoutes = require('./routes/participantes.routes')
const authRoutes = require('./routes/auth.routes')

const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
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