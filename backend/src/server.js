const express = require('express')
const cors = require('cors')
const path = require('path')
const participantesRoutes = require('./routes/participantes.routes')
const authRoutes = require('./routes/auth.routes')

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}))
app.options('*', cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/api/auth', authRoutes)
app.use('/api/participantes', participantesRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
