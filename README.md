# 🤖 FinanceAI

Aplicação de gestão financeira pessoal com conexão bancária real via Open Banking e insights gerados por Inteligência Artificial.

🔗 **[Ver demo ao vivo](https://financeai-dun.vercel.app)**

---

## ✨ Funcionalidades

- **Login com Google** via NextAuth
- **Conexão bancária** — integração com mais de 300 bancos e fintechs brasileiras via Pluggy (Open Banking)
- **Importação automática** de transações bancárias
- **Categorização por IA** — Google Gemini classifica cada transação automaticamente
- **Insights financeiros** — análise personalizada dos seus gastos com recomendações práticas
- **Dashboard completo** — saldo, receitas, despesas e histórico de transações
- **Busca e filtros** por categoria e descrição

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| [Next.js 15](https://nextjs.org/) | Framework fullstack (App Router) |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização |
| [NextAuth.js](https://next-auth.js.org/) | Autenticação com Google OAuth |
| [Supabase](https://supabase.com/) | Banco de dados PostgreSQL |
| [Pluggy](https://pluggy.ai/) | Open Banking — conexão bancária |
| [Google Gemini](https://ai.google.dev/) | IA para insights e categorização |
| [Vercel](https://vercel.com/) | Deploy |

---

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com/)
- Conta no [Pluggy](https://pluggy.ai/)
- Conta no [Google AI Studio](https://aistudio.google.com/)
- Projeto no [Google Cloud Console](https://console.cloud.google.com/) com OAuth configurado

### Instalação

```bash
git clone https://github.com/cauamconceicao/financeai.git
cd financeai
npm install
```

### Variáveis de ambiente

Cria um arquivo `.env.local` na raiz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Google Gemini
GEMINI_API_KEY=sua_chave_gemini

# Pluggy Open Banking
PLUGGY_CLIENT_ID=seu_client_id
PLUGGY_CLIENT_SECRET=seu_client_secret

# NextAuth
NEXTAUTH_SECRET=sua_chave_secreta
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
```

```bash
npm run dev
```

Acesse em `http://localhost:3000`

---

## 🗄️ Tabelas do banco

```sql
-- Usuários
CREATE TABLE financeai_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conexões bancárias
CREATE TABLE financeai_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES financeai_users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  connector_name TEXT,
  status TEXT DEFAULT 'updated',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transações
CREATE TABLE financeai_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES financeai_users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES financeai_connections(id) ON DELETE CASCADE,
  external_id TEXT UNIQUE,
  description TEXT,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  category TEXT,
  ai_category TEXT,
  account TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Google OAuth
│   │   ├── pluggy/              # Connect token + sync bancário
│   │   ├── transactions/        # CRUD transações
│   │   └── ai/                  # Insights e categorização
│   ├── dashboard/               # Painel principal
│   ├── connect/                 # Widget Pluggy
│   └── page.js                  # Landing page
├── components/
│   ├── Navbar.jsx
│   ├── DashboardCards.jsx
│   └── TransactionList.jsx
└── lib/
    ├── supabase.js              # Cliente Supabase
    ├── pluggy.js                # Integração Open Banking
    └── openai.js                # Integração Gemini AI
```

---

## 🔐 Como funciona o Open Banking

1. O usuário clica em **Conectar Banco**
2. O widget da Pluggy abre com todos os bancos disponíveis
3. O usuário autentica com suas credenciais bancárias (nunca armazenadas)
4. A Pluggy retorna as transações via API
5. O FinanceAI salva e categoriza com IA automaticamente

---

## 📄 Licença

MIT © [Cauã Conceição](https://github.com/cauamconceicao)