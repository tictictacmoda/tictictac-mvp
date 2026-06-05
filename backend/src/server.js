
const express = require('express')
const cors = require('cors')
const participantesRoutes = require('./routes/participantes.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/participantes', participantesRoutes)

app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001')
})
