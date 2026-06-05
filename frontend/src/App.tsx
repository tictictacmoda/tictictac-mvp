
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function App() {
  const [participantes, setParticipantes] = useState([])

  async function carregar() {
    const response = await axios.get('http://localhost:3001/api/participantes')
    setParticipantes(response.data)
  }

  async function criar() {
    await axios.post('http://localhost:3001/api/participantes', {
      nome: 'Novo Participante',
      email: 'email@teste.com',
      area: 'Tecnologia'
    })

    carregar()
  }

  useEffect(() => {
    carregar()
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>TICTICTAC</h1>

      <button onClick={criar}>
        Novo Participante
      </button>

      <ul>
        {participantes.map((p: any) => (
          <li key={p.id}>
            {p.nome} — {p.area}
          </li>
        ))}
      </ul>
    </div>
  )
}
