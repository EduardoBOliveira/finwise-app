# 💰 FinWise — Financial Dashboard

FinWise é uma aplicação web moderna de **controle e visualização financeira**, desenvolvida para ajudar usuários a acompanhar receitas, despesas, investimentos e faturas de forma clara, intuitiva e visual.

O projeto foi construído com foco em **boa experiência do usuário**, **arquitetura limpa** e **boas práticas de desenvolvimento frontend**.

---

## ✨ Funcionalidades

- 📊 Dashboard financeiro com visão geral
- 💸 Controle de despesas (incluindo parcelas)
- 💳 Organização por cartões de crédito
- 📈 Visualização de dados e insights financeiros
- 🔐 Integração com Supabase (Auth + Database)
- 🎨 Interface moderna e responsiva
- ⚡ Build otimizado para produção

---

## 🧠 Tecnologias Utilizadas

- **Vite** — Bundler rápido e moderno
- **React** — Biblioteca para construção da interface
- **TypeScript** — Tipagem estática e segurança
- **Tailwind CSS** — Estilização utilitária
- **shadcn/ui** — Componentes acessíveis e reutilizáveis
- **Supabase** — Backend as a Service (Auth + DB)
- **Node.js** — Ambiente de execução

---

## 📁 Estrutura do Projeto (resumida)

```
src/
 ├─ components/     # Componentes reutilizáveis
 ├─ pages/          # Páginas da aplicação
 ├─ services/       # Integrações externas (Supabase)
 ├─ hooks/          # Hooks customizados
 ├─ utils/          # Funções utilitárias
 └─ styles/         # Estilos globais
```

---

## 🚀 Como rodar o projeto localmente

Pré-requisitos
Node.js (versão LTS recomendada)

- npm ou pnpm

Passo a passo

```
# Clone o repositório
git clone https://github.com/EduardoBOliveira/finwise-app.git

# Acesse a pasta
cd finwise-app

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
A aplicação estará disponível em:

http://localhost:8080
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo .env.local na raiz do projeto:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
⚠️ As variáveis de ambiente não devem ser commitadas no repositório.
```

---

## 🏗️ Build para Produção

- npm run build

Para visualizar o build localmente:

- npm run preview

---

## 🌐 Deploy

O projeto é compatível com plataformas como

- Vercel
- Netlify

ou qualquer serviço que suporte aplicações Vite/React.

---

## 📌 Status do Projeto

🟢 Em desenvolvimento ativo

📈 Evoluindo com foco em performance, UX e novos insights financeiros

---

## 👤 Autor

Desenvolvido por Eduardo Bezerra

📎 GitHub: @EduardoBOliveira

---

## 📄 Licença

Este projeto é de uso pessoal e educacional.
Sinta-se à vontade para estudar, adaptar e evoluir.
