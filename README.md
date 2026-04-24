# Indústrias Wayne — Sistema de Gestão e Segurança

Plataforma web fullstack para gerenciamento de recursos internos, controle de acesso por rota e auditoria de atividades das Indústrias Wayne.

---

## Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitetura](#arquitetura)
- [Banco de Dados](#banco-de-dados)
- [Controle de Acesso por Rota](#controle-de-acesso-por-rota)
- [Permissões por Role](#permissões-por-role)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Setup e Instalação](#setup-e-instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)

---

## Visão Geral

| Módulo | Descrição |
|---|---|
| **Gestão de Recursos** | CRUD completo de equipamentos, veículos e dispositivos de segurança |
| **Locais** | Locais físicos (Garagem, Hangar, Prédio) com vínculo a veículos e equipamentos |
| **Controle de Acesso** | Segurança por rota com 4 níveis: Baixa, Média (PIN), Alta (Scan Facial) e Máxima (Admin + Scan) |
| **Dashboard** | Painel analítico com cards interativos, carrossel de itens por categoria/status e gráficos |
| **Splash Screen** | Vídeo de boas-vindas exibido na tela inicial e após login |

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
| Carrossel | Embla Carousel |
| Validação | Zod |
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

1. Usuário acessa `/` → tela inicial com splash screen (vídeo)
2. Faz login em `/auth/login` → `supabase.auth.signInWithPassword`
3. Após login → splash screen de boas-vindas → `/dashboard`
4. O middleware (`middleware.ts`) atualiza a sessão em cada requisição
5. O layout do dashboard verifica a sessão e propaga o perfil via props

### Controle de Acesso por Rota

```
Usuário navega para rota protegida
        │
        ▼
RouteGate busca configuração no banco (route_security)
        │
        ├─ Baixa → acesso imediato (login = suficiente)
        │
        ├─ Média → exige PIN (comparado com profiles.pin)
        │
        ├─ Alta  → exibe simulação de scan facial (4s)
        │          → acesso concedido após scan
        │
        └─ Máxima → verifica role === 'admin'
                   → se não admin: acesso negado imediatamente
                   → se admin: scan facial → acesso concedido
```

O desafio é exibido **no lugar do conteúdo da página** (não como popup), garantindo que o usuário não possa acessar o conteúdo em caso de negação.

---

## Banco de Dados

### Tabelas

| Tabela | Descrição |
|---|---|
| `profiles` | Perfil do usuário com `role`, `department` e `pin` |
| `equipment` | Inventário de equipamentos com status, local e imagem |
| `vehicles` | Frota de veículos com tipo, placa, local e imagem |
| `security_devices` | Dispositivos de segurança (câmeras, sensores, biometria) |
| `locations` | Locais físicos (Garagem, Hangar, Prédio) com imagem |
| `route_security` | Nível de segurança configurado por rota do sistema |
| `restricted_areas` | Áreas restritas com nível de segurança e status operacional |
| `area_access` | Permissões de acesso por usuário por área |
| `access_logs` | Log de tentativas de acesso (granted/denied) |
| `activity_logs` | Auditoria geral de ações (create/update/delete) |

### Migrações adicionais necessárias

Execute no SQL Editor do Supabase após o seed principal:

```sql
-- Locais físicos
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.vehicles  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL;

-- PIN de acesso por usuário
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pin TEXT;

-- Segurança por rota
CREATE TABLE IF NOT EXISTS public.route_security (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route         TEXT NOT NULL UNIQUE,
  label         TEXT NOT NULL,
  security_level TEXT CHECK (security_level IN ('low','medium','high','maximum')),
  updated_by    UUID REFERENCES public.profiles(id),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Enums

```sql
user_role:       employee | manager | admin
resource_status: available | in_use | maintenance | retired
device_status:   active | inactive | maintenance
security_level:  low | medium | high | maximum
area_status:     operational | lockdown | maintenance
```

---

## Controle de Acesso por Rota

O administrador configura o nível de segurança de cada rota em **Dashboard → Controle de Acesso**.

| Rota | Label |
|---|---|
| `/dashboard/equipment` | Equipamentos |
| `/dashboard/vehicles` | Veículos |
| `/dashboard/security-devices` | Dispositivos de Segurança |
| `/dashboard/locations` | Locais |
| `/dashboard/access-control` | Controle de Acesso |
| `/dashboard/users` | Usuários |
| `/dashboard/activity-logs` | Logs de Atividade |

### Níveis de segurança

| Nível | Comportamento |
|---|---|
| **Baixa** | Apenas login — acesso imediato |
| **Média** | Solicita PIN de 4–6 dígitos (definido pelo admin no perfil do usuário) |
| **Alta** | Exibe simulação de scan facial CSS (~4s) — qualquer usuário logado passa |
| **Máxima** | Apenas administradores + scan facial |

O PIN é gerenciado pelo admin em **Usuários → Editar** e armazenado no campo `profiles.pin`.

---

## Permissões por Role

| Ação | employee | manager | admin |
|---|:---:|:---:|:---:|
| Visualizar recursos | ✅ | ✅ | ✅ |
| Criar recursos | ❌ | ✅ | ✅ |
| Editar recursos | ❌ | ✅ | ✅ |
| Excluir recursos | ❌ | ❌ | ✅ |
| Gerenciar usuários | ❌ | ✅ | ✅ |
| Definir PIN de usuários | ❌ | ❌ | ✅ |
| Ver logs de atividade | ❌ | ✅ | ✅ |
| Configurar segurança de rotas | ❌ | ❌ | ✅ |
| Acessar rotas de nível Máximo | ❌ | ❌ | ✅ |

---

## Estrutura do Projeto

```
wayne/
├── app/
│   ├── page.tsx               # Tela inicial com splash screen
│   ├── auth/                  # Login, cadastro e layout de autenticação
│   └── dashboard/
│       ├── layout.tsx         # RouteGate + sidebar/header
│       ├── page.tsx           # Dashboard (stats + gráficos + carrossel)
│       ├── equipment/         # CRUD de equipamentos
│       ├── vehicles/          # CRUD de veículos
│       ├── security-devices/  # CRUD de dispositivos de segurança
│       ├── locations/         # Página de locais físicos
│       ├── access-control/    # Configuração de segurança por rota
│       ├── users/             # Gestão de usuários (manager/admin)
│       ├── activity-logs/     # Auditoria de ações
│       └── settings/          # Perfil e senha do usuário
│
├── components/
│   ├── ui/                    # Primitivos shadcn/ui + ImagePicker
│   ├── dashboard/             # Sidebar, header, stats (com carrossel), items-drawer
│   ├── access-control/        # RouteGate, FacialScan, RouteSecurityManager
│   ├── equipment/             # Form com ImagePicker
│   ├── vehicles/              # Form com ImagePicker
│   ├── security-devices/      # Form, table
│   ├── users/                 # CreateUserDialog, EditUserDialog (com PIN)
│   ├── home-backgrounds/      # Opções de background animado (A e B)
│   ├── home-splash.tsx        # Splash na tela inicial
│   └── splash-screen.tsx      # Splash após login
│
├── lib/
│   ├── supabase/              # Clientes server, client, admin, middleware
│   ├── types/database.ts      # Interfaces TypeScript + ROLE_PERMISSIONS
│   ├── validations.ts         # Schemas Zod
│   └── log-activity.ts        # Helper para gravar em activity_logs
│
├── public/
│   ├── locais/                # garage.png, hangar.png, predio.png
│   ├── veiculos/              # heli.png, jato.png
│   ├── logo-wayne.mp4         # Vídeo splash após login
│   └── logo-bem-vindo.mp4     # Vídeo alternativo
│
├── supabase/seed.sql          # Seed completo (áreas, dispositivos, locais, route_security)
└── middleware.ts              # Atualização de sessão Supabase
```

---

## Setup e Instalação

### Pré-requisitos

- Node.js `v18+`
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone https://github.com/SantanaDZ/wayne.git
cd wayne
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie o arquivo `.env.local` na raiz com as variáveis abaixo.

### 4. Configure o banco de dados

No painel do Supabase, abra o **SQL Editor** e execute nesta ordem:

```
scripts/001_create_tables.sql
scripts/002_profile_trigger.sql
scripts/004_add_image_to_resources.sql
scripts/007_sync_resource_schemas.sql
supabase/seed.sql
```

Em seguida execute as migrações adicionais da seção [Banco de Dados](#banco-de-dados).

> Para usuários de teste: `scripts/003_seed_users_v2.sql`, `scripts/008_set_user_roles.sql`, `scripts/009_confirm_user_emails.sql`

### 5. Inicie o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Variáveis de Ambiente

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role |

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> `SUPABASE_SERVICE_ROLE_KEY` é usada apenas server-side. **Nunca exponha no frontend.**

---

## Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento (Turbopack)
npm run build      # Build de produção
npm run start      # Servidor de produção
npm run lint       # ESLint
```

---

*Wayne Enterprises © 2026 — Protegendo o futuro de Gotham.*
