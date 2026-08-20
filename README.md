# UniCalendar

Calendários compartilhados para estudantes. Crie calendários, compartilhe links, organize eventos com seu grupo.

![Dashboard](https://github.com/user-uniCalendar/dashboard.png)

## Demo

Acesse [unicalendar.app](http://unicalendar.app) (em breve)

## Stack

- **Backend:** Laravel 13, PHP 8.3, SQLite, Eloquent ORM
- **Frontend:** React 19, TypeScript, Inertia.js v3, Tailwind CSS v4
- **UI:** shadcn/ui (Base UI)
- **Testes:** Pest v4
- **Build:** Vite 8

## Rodando local

### Pré-requisitos

- [PHP 8.3+](https://www.php.net/downloads) (com extensões: mbstring, pdo_sqlite, gd, openssl, tokenizer, fileinfo)
- [Composer](https://getcomposer.org/)
- [Node.js 18+](https://nodejs.org/) e npm

### Instalação

```bash
# Clonar
git clone https://github.com/seu-usuario/unicalendar.git
cd unicalendar

# Instalar dependências
composer install
npm install

# Configurar ambiente
cp .env.example .env
php artisan key:generate

# Criar banco SQLite
touch database/database.sqlite

# Rodar migrations + dados de demonstração
php artisan migrate --seed

# Criar symlink de storage (para avatars)
php artisan storage:link

# Build do frontend
npm run build
```

### Iniciar

```bash
composer run dev
```

Acesse **http://localhost:8000**

### Usuários de demonstração

| Nome | Email | Senha |
|------|-------|-------|
| Ana Silva | ana@example.com | password |
| Bruno Costa | bruno@example.com | password |
| Carlos Mendes | carlos@example.com | password |

## Funcionalidades

- **Calendários compartilhados** — crie, edite, delete calendários públicos ou privados
- **Eventos** — criar, editar, excluir com tipo, data, local e link de reunião
- **Presença (RSVP)** — confirme presença, talvez ou não vou
- **Comentários** — comente nos eventos
- **Importar ICS** — importe calendários do Google Calendar, Outlook ou Apple Calendar
- **Notificações por email** — lembretes e alertas de eventos
- **Foto de perfil** — upload e gerenciamento de avatar
- **Dark mode** — toggle com persistência
- **Calendário unificado** — visualização de todos os eventos em um grid
- **Filtros** — filtre eventos por tipo
- **Paginação** — sidebar com paginação de eventos

## Testes

```bash
php artisan test --compact
```

## Estrutura

```
app/
├── Http/Controllers/     # Controllers
├── Models/               # Eloquent models
├── Policies/             # Autorização
├── Notifications/        # Notificações email
└── Enums/                # Enums (CalendarRole, EventType)

resources/js/
├── pages/                # Páginas React (Inertia)
│   ├── auth/             # Login, Register
│   ├── calendar/         # Show, Create, Settings, List, Import
│   ├── event/            # Show, Create, Edit, Quick-Create
│   ├── settings/         # Perfil, Notificações
│   └── errors/           # 403, 404, 500
├── components/ui/        # shadcn/ui
└── layouts/              # Layouts (app-layout)

routes/web.php            # Rotas
database/migrations/      # Migrations
```

## Licença

MIT
