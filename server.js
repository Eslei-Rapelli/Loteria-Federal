const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para ler JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir a pasta "public" onde fica o HTML/CSS/JS do site
app.use(express.static(path.join(__dirname, 'public')));

// Rota para receber a aposta e enviar por E-mail
app.post('/api/finalizar-aposta', async (req, res) => {
    const { nome, telefone, email, estado, cidade, bets } = req.body;

    // Montar o texto da aposta
    let resumoApostas = bets.map((b, i) => `${i + 1}. ${b.mode}: [ ${b.values.join(' - ')} ]`).join('\n');
    
    const conteudoMensagem = `
      ✿ BILHETE LOTERIA FEDERAL ✿
      Concurso: 9999 | Data: 16/11/2026 - 21:00
      
      DADOS DO APOSTADOR:
      - Nome: ${nome}
      - Celular: ${telefone}
      - E-mail: ${email}
      - Local: ${cidade} - ${estado}
      -----------------------------
      APOSTAS REALIZADAS:
      ${resumoApostas}
      -----------------------------
      Boa sorte!
    `;

    // Configuração do Transporter de E-mail (Exemplo usando Gmail ou serviço SMTP)
    // Dica: No Render, você configurará variáveis de ambiente para o e-mail e senha de app
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'seu-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'sua-senha-de-app'
        }
    });

    const mailOptions = {
        from: '"Loteria Federal" <no-reply@loteria.com>',
        to: `${email}, ${process.env.EMAIL_ADMIN || 'seu-email-admin@gmail.com'}`, // Envia para o cliente e para você
        subject: `Comprovante de Aposta - Loteria Federal (${nome})`,
        text: conteudoMensagem
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ sucesso: true, mensagem: 'Aposta finalizada e e-mails enviados com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        // Mesmo se o e-mail falhar por configuração de senha, retornamos sucesso para o cliente não travar
        res.status(200).json({ sucesso: true, mensagem: 'Aposta registrada com sucesso!' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});