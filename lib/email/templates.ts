export const WELCOME_EMAIL_TEMPLATE = (clientName: string, bookingDate: string, artistName: string, bookingId: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0d0d0d; color: #ffffff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 30px; border-radius: 12px; border: 1px solid #333; }
        .header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #00ff9d; }
        .content { line-height: 1.6; color: #cccccc; }
        .highlight { color: #00ff9d; font-weight: bold; }
        .card { background-color: #252525; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #444; }
        .button { display: inline-block; background-color: #00ff9d; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ALTUS INK</div>
        </div>
        <div class="content">
            <h2>Olá, ${clientName}!</h2>
            <p>Sua sessão está confirmada. Mal podemos esperar para criar algo incrível com você.</p>
            
            <div class="card">
                <p><strong>Artista:</strong> ${artistName}</p>
                <p><strong>Data:</strong> ${bookingDate}</p>
                <p><strong>Local:</strong> Altus Ink Studio, Lisboa</p>
            </div>

            <h3>⚠️ Guia de Preparação (Importante)</h3>
            <ul>
                <li>Não consuma álcool nas 24h anteriores.</li>
                <li>Tenha uma boa noite de sono.</li>
                <li>Coma bem antes de vir.</li>
                <li>Traga snacks e água.</li>
            </ul>

            <center>
                <a href="https://altusink.com/consent/${bookingId}" class="button">Assinar Termo de Consentimento</a>
            </center>
        </div>
        <div class="footer">
            <p>Altus Ink Studio • Lisboa, Portugal</p>
        </div>
    </div>
</body>
</html>
`;

export const HEALING_CHECK_TEMPLATE = (clientName: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0d0d0d; color: #ffffff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 30px; border-radius: 12px; border: 1px solid #333; }
        .header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #00ff9d; }
        .content { line-height: 1.6; color: #cccccc; }
        .button { display: inline-block; background-color: #333; color: #00ff9d; padding: 10px 20px; text-decoration: none; border-radius: 6px; border: 1px solid #00ff9d; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ALTUS INK</div>
        </div>
        <div class="content">
            <h2>Oi, ${clientName}! 👋</h2>
            <p>Já se passaram 3 dias. Como está sua tatuagem?</p>
            
            <p>Nesta fase, é normal sentir uma leve coceira e descamação. Lembre-se:</p>
            <ul>
                <li>Mantenha hidratada (mas sem exagerar).</li>
                <li>Não arranque as casquinhas!</li>
                <li>Evite sol e piscina.</li>
            </ul>

            <p>Se notar algo estranho, responda este e-mail.</p>
            
            <p>Se estiver tudo ótimo (e sabemos que está), que tal nos deixar uma avaliação?</p>
            <center>
                <a href="https://g.page/altusink/review" class="button">Avaliar no Google ⭐⭐⭐⭐⭐</a>
            </center>
        </div>
        <div class="footer">
            <p>Estamos sempre aqui por você.</p>
        </div>
    </div>
</body>
</html>
`;
