const nodemailer = require('nodemailer')

function criarTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  })
}

exports.enviarBoasVindas = async (participante) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) return
  try {
    const transporter = criarTransporter()
    await transporter.sendMail({
      from: `"TIC TIC TAC" <${process.env.GMAIL_USER}>`,
      to: participante.email,
      subject: '🌍 Bem-vindo ao Projeto Brasil — Impacto Global!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f0f2f5;padding:20px">
          <div style="background:#1a2332;color:#fff;padding:30px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="margin:0;font-size:28px;letter-spacing:2px">TIC TIC TAC</h1>
            <p style="margin:8px 0 0;color:#8aaccc;font-size:13px">Projeto Brasil — Impacto Global</p>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px">
            <h2 style="color:#1a2332">Olá, ${participante.nome}! 👋</h2>
            <p style="color:#555;line-height:1.6">Seu cadastro foi realizado com sucesso no <strong>Projeto Brasil — Impacto Global</strong>.</p>
            <div style="background:#f0f2f5;border-radius:8px;padding:16px;margin:20px 0">
              <p style="margin:0 0 8px;color:#888;font-size:12px;text-transform:uppercase;font-weight:700">Seus dados cadastrados</p>
              <p style="margin:4px 0;color:#333"><strong>Nome:</strong> ${participante.nome}</p>
              <p style="margin:4px 0;color:#333"><strong>Cargo:</strong> ${participante.cargo || '—'}</p>
              <p style="margin:4px 0;color:#333"><strong>Área:</strong> ${participante.area}</p>
              <p style="margin:4px 0;color:#333"><strong>Estado:</strong> ${participante.estado}</p>
            </div>
            <p style="color:#555;line-height:1.6">Em breve entraremos em contato com mais informações sobre o projeto.</p>
            <p style="color:#888;font-size:12px;margin-top:24px">Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      `
    })
  } catch(e) {
    console.error('Erro ao enviar email:', e.message)
  }
}
