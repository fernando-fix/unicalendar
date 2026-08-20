# UniCalendar

Calendários compartilhados para estudantes. Crie calendários, compartilhe links, organize eventos com seu grupo.

## Sobre

Cansou de perguntar no grupo "quando é a prova?" ou "qual o prazo do trabalho?" O UniCalendar resolve isso. Cria um calendário, manda o link no WhatsApp, e todo mundo visualiza os eventos. Sem complicação.

## Funcionalidades

- **Calendários compartilhados** — crie calendários públicos ou privados e compartilhe por link
- **Eventos** — crie com tipo (prova, reunião, prazo, apresentação), data, local e link de reunião
- **Presença (RSVP)** — confirme presença: vou participar, talvez ou não vou
- **Comentários** — comente nos eventos pra tirar dúvidas
- **Importar ICS** — importe calendários do Google Calendar, Outlook ou Apple Calendar
- **Notificações por email** — lembretes antes dos eventos
- **Foto de perfil** — upload e gerenciamento de avatar
- **Dark mode** — toggle com persistência
- **Calendário unificado** — visualização de todos os seus eventos em um grid
- **Filtros e paginação** — filtre por tipo de evento

## Stack

- **Backend:** Laravel 13, PHP 8.3, SQLite, Eloquent ORM
- **Frontend:** React 19, TypeScript, Inertia.js v3, Tailwind CSS v4
- **UI:** shadcn/ui (Base UI)
- **Testes:** Pest v4
- **Build:** Vite 8

## Rodando local

### Pré-requisitos

- [PHP 8.3+](https://www.php.net/downloads) (extensões: mbstring, pdo_sqlite, gd, openssl, tokenizer, fileinfo)
- [Composer](https://getcomposer.org/)
- [Node.js 18+](https://nodejs.org/) e npm

### Instalação

```bash
# Clonar
git clone https://github.com/fernando-fix/unicalendar.git
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
