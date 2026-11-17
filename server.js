const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Pasta pública onde fica o seu index.html

// Configuração do Nodemailer (Exemplo com Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'seu-email-aqui@gmail.com', // Seu e-mail que faz o disparo
        pass: 'sua-senha-de-app-do-gmail'   // Senha de aplicativo do Gmail
    }
});

// Rota da API chamada pelo site
app.post('/api/enviar-comprovante', async (req, res) => {
    const { nome, email, whatsapp, apostas } = req.body;

    // SEU E-MAIL ADMINISTRATIVO (onde você vai receber a cópia)
    const meuEmailAdmin = "seu-email-aqui@gmail.com"; 

    try {
        const mailOptions = {
            from: 'seu-email-aqui@gmail.com',
            to: [email, meuEmailAdmin], // Envia simultaneamente para o cliente e para você!
            subject: `Nova Aposta Registrada - ${nome}`,
            text: `Olá!\n\nUma nova aposta foi registrada.\n\nCliente: ${nome}\nE-mail: ${email}\nWhatsApp: ${whatsapp}\n\nApostas:\n${JSON.stringify(apostas, null, 2)}`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ sucesso: true, mensagem: 'E-mails enviados com sucesso!' });
    } catch (erro) {
        console.error('Erro ao enviar e-mail:', erro);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao enviar e-mail no servidor.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
