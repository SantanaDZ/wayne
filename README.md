# Indústrias Wayne — Sistema de Gestão e Segurança

Plataforma web fullstack para gerenciamento de recursos internos, controle de acesso físico e auditoria de atividades das Indústrias Wayne.

---

## Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitetura](#arquitetura)
- [Banco de Dados](#banco-de-dados)
- [Permissões por Role](#permissões-por-role)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Setup e Instalação](#setup-e-instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)

---

## Visão Geral

O sistema atende a três pilares principais exigidos pela proposta:

| Módulo | Descrição |
|---|---|
| **Gestão de Recursos** | CRUD completo de equipamentos, veículos e dispositivos de segurança |
| **Controle de Acesso** | Áreas restritas com scanner biométrico, permissões por usuário e logs de acesso |
| **Dashboard** | Painel analítico com gráficos de status, atividades recentes e estatísticas |

---

## Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5.7 |
| Estilização | Tailwind CSS v4 + shadcn/ui + Radix UI |
| Banco de Dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth (SSR flow com `@supabase/ssr`) |
| Gráficos | Recharts |
| Validação | Zod |
| Testes | Vitest + Testing Library |
| Deploy | Vercel (recomendado) |

---

## Arquitetura

```
Browser (React / Next.js App Router)
         │
         │  Server Components (fetch direto ao Supabase)
         │  Client Components (Supabase browser client)
         │
         ▼
   Next.js Server (middleware de autenticação)
         │
         │  Supabase JS SDK (@supabase/ssr)
         ▼
   Supabase (PostgreSQL + Auth + RLS)
```

### Fluxo de Autenticação

1. Usuário faz login em `/auth/login` via `supabase.auth.signInWithPassword`
2. O middleware (`middleware.ts`) atualiza a sessão em cada requisição
3. O layout do dashboard (`app/dashboard/layout.tsx`) verifica a sessão — redireciona para `/auth/login` se não autenticado
4. O perfil do usuário (com `role`) é buscado da tabela `profiles` e propagado via props

### Controle de Acesso Biométrico

```
Usuário clica "Iniciar Escaneamento"
        │
        ▼
  Animação de scan (2s)
        │
        ▼
  checkAccess() consulta banco:
  1. role === 'admin'? → concede
  2. area.status === 'lockdown'? → nega
  3. SELECT em area_access WHERE area_id + profile_id → concede se registro válido e não expirado
        │
        ▼
  Resultado gravado em access_logs
```

---

## Banco de Dados

### Tabelas

| Tabela | Descrição |
|---|---|
| `profiles` | Perfil do usuário (estende `auth.users`) com `role` e `department` |
| `equipment` | Inventário de equipamentos com status e atribuição |
| `vehicles` | Frota de veículos com tipo, placa e status |
| `security_devices` | Dispositivos de segurança (câmeras, sensores, biometria) |
| `restricted_areas` | Áreas restritas com nível de segurança e status operacional |
| `area_access` | Permissões de acesso por usuário por área (com validade opcional) |
| `access_logs` | Log de tentativas de acesso biométrico (granted/denied) |
| `activity_logs` | Auditoria geral de ações (create/update/delete) no sistema |

### Enums

```sql
user_role:       employee | manager | admin
resource_status: available | in_use | maintenance | retired
device_status:   active | inactive | maintenance
security_level:  low | medium | high | maximum
area_status:     operational | lockdown | maintenance
```

### Row Level Security (RLS)

Todas as tabelas têm RLS ativado. Resumo das políticas:

- **profiles**: leitura pública, escrita apenas pelo próprio usuário
- **equipment / vehicles / security_devices**: leitura pública, insert/update por manager+admin, delete apenas admin
- **restricted_areas**: leitura pública, escrita por manager+admin
- **area_access**: leitura pelo próprio usuário ou manager+admin, insert por manager+admin
- **access_logs**: insert pelo próprio perfil, leitura pelo próprio ou manager+admin
- **activity_logs**: insert pelo próprio usuário, leitura pelo próprio ou manager+admin

---

## Permissões por Role

| Ação | employee | manager | admin |
|---|:---:|:---:|:---:|
| Visualizar recursos | ✅ | ✅ | ✅ |
| Criar recursos | ❌ | ✅ | ✅ |
| Editar recursos | ❌ | ✅ | ✅ |
| Excluir recursos | ❌ | ❌ | ✅ |
| Gerenciar usuários | ❌ | ✅ | ✅ |
| Ver logs de atividade | ❌ | ✅ | ✅ |
| Criar áreas restritas | ❌ | ✅ | ✅ |
| Conceder acesso a áreas | ❌ | ✅ | ✅ |
| Acesso irrestrito (biométrico) | ❌ | ❌ | ✅ |

---

## Estrutura do Projeto

```
wayne/
├── app/
│   ├── auth/                  # Login, cadastro e layout de autenticação
│   └── dashboard/
│       ├── layout.tsx         # Guard de autenticação + sidebar/header
│       ├── page.tsx           # Dashboard principal (stats + gráficos)
│       ├── equipment/         # CRUD de equipamentos
│       ├── vehicles/          # CRUD de veículos
│       ├── security-devices/  # CRUD de dispositivos de segurança
│       ├── access-control/    # Áreas restritas e scanner biométrico
│       ├── users/             # Gestão de usuários (manager/admin)
│       ├── activity-logs/     # Auditoria de ações (manager/admin)
│       └── settings/          # Perfil e senha do usuário
│
├── components/
│   ├── ui/                    # Primitivos shadcn/ui
│   ├── dashboard/             # Sidebar, header, charts, stats
│   ├── equipment/             # Form, table, delete dialog
│   ├── vehicles/              # Form, table, delete dialog
│   ├── security-devices/      # Form, table, delete dialog
│   ├── access-control/        # BiometricAccessDialog, AreaForm
│   ├── users/                 # CreateUserDialog, EditUserDialog
│   └── settings/              # ProfileForm, PasswordForm
│
├── lib/
│   ├── supabase/              # Clientes server, client, admin, middleware
│   ├── types/database.ts      # Interfaces TypeScript + ROLE_PERMISSIONS
│   ├── validations.ts         # Schemas Zod (equipment, vehicle, device)
│   └── log-activity.ts        # Helper para gravar em activity_logs
│
├── scripts/                   # Migrations SQL (executar em ordem)
├── supabase/seed.sql          # Dados de seed (áreas restritas + dispositivos)
├── middleware.ts              # Atualização de sessão Supabase em cada request
└── __tests__/                 # Testes Vitest (validações + permissões)
```

---

## Setup e Instalação

### Pré-requisitos

- Node.js `v18+`
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd wayne
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie o arquivo `.env.local` na raiz (veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente)).

### 4. Configure o banco de dados

No painel do Supabase, abra o **SQL Editor** e execute os scripts na seguinte ordem:

```
scripts/001_create_tables.sql       # Tabelas principais + RLS
scripts/002_profile_trigger.sql     # Trigger de criação automática de perfil
scripts/004_add_image_to_resources.sql
scripts/007_sync_resource_schemas.sql  # Sincroniza colunas com o frontend
supabase/seed.sql                   # Áreas restritas e dispositivos de exemplo
```

> Para criar usuários de teste, execute também:
> ```
> scripts/003_seed_users_v2.sql
> scripts/008_set_user_roles.sql
> scripts/009_confirm_user_emails.sql
> ```

### 5. Inicie o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Variáveis de Ambiente

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → service_role key |

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> `SUPABASE_SERVICE_ROLE_KEY` é usada apenas server-side para operações administrativas (criar/deletar usuários). **Nunca exponha no frontend.**

---

## Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento (Turbopack)
npm run build      # Build de produção
npm run start      # Servidor de produção
npm run test       # Executa os testes (Vitest)
npm run test:watch # Testes em modo watch
npm run lint       # ESLint
```

---

*Wayne Enterprises © 2026 — Protegendo o futuro de Gotham.*
