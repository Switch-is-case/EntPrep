type Lang = "ru" | "kz" | "en";

interface VerificationEmailParams {
  userName: string;
  verificationUrl: string;
  lang: Lang;
}

const translations = {
  ru: {
    subject: "Подтвердите email для ENTPrep",
    greeting: (name: string) => `Привет, ${name}!`,
    body: "Спасибо за регистрацию в ENTPrep. Чтобы начать готовиться к ЕНТ, подтверди свой email — это нужно сделать один раз.",
    button: "Подтвердить email",
    linkExplanation: "Или скопируй эту ссылку в браузер:",
    footer: "Ссылка действует 24 часа. Если ты не регистрировался в ENTPrep, просто проигнорируй это письмо.",
  },
  kz: {
    subject: "ENTPrep үшін email растаңыз",
    greeting: (name: string) => `Сәлем, ${name}!`,
    body: "ENTPrep-ке тіркелгеніңіз үшін рахмет. ҰБТ-ға дайындалу үшін email-іңізді растаңыз — мұны бір рет істеу керек.",
    button: "Email растау",
    linkExplanation: "Немесе бұл сілтемені браузерге көшіріңіз:",
    footer: "Сілтеме 24 сағат жарамды. Егер сіз ENTPrep-ке тіркелмеген болсаңыз, бұл хатқа мән бермеңіз.",
  },
  en: {
    subject: "Verify your email for ENTPrep",
    greeting: (name: string) => `Hi ${name}!`,
    body: "Thanks for signing up to ENTPrep. To start preparing for ENT, please verify your email — you only need to do this once.",
    button: "Verify Email",
    linkExplanation: "Or copy this link to your browser:",
    footer: "This link expires in 24 hours. If you didn't sign up for ENTPrep, please ignore this email.",
  },
};

export function getVerificationEmail(params: VerificationEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const { userName, verificationUrl, lang } = params;
  const t = translations[lang] || translations.ru;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            color: #334155;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 32px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #0f172a;
          }
          .body-text {
            font-size: 16px;
            line-height: 24px;
            margin-bottom: 32px;
          }
          .button-container {
            margin-bottom: 32px;
          }
          .button {
            background-color: #2563eb;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
          }
          .link-explanation {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 8px;
          }
          .link {
            font-size: 14px;
            color: #2563eb;
            word-break: break-all;
          }
          .footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #64748b;
            line-height: 18px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">ENTPrep</div>
          <div class="greeting">${t.greeting(userName)}</div>
          <div class="body-text">${t.body}</div>
          <div class="button-container">
            <a href="${verificationUrl}" class="button">${t.button}</a>
          </div>
          <div class="link-explanation">${t.linkExplanation}</div>
          <div class="link">${verificationUrl}</div>
          <div class="footer">${t.footer}</div>
        </div>
      </body>
    </html>
  `;

  const text = `
    ${t.greeting(userName)}

    ${t.body}

    ${t.button}: ${verificationUrl}

    ${t.footer}
  `;

  return {
    subject: t.subject,
    html,
    text,
  };
}
