# Отчет по архитектуре (Clean Architecture / Pragmatic Next.js)

## Обзор
Проект имеет слоистую структуру, близкую к Clean / Hexagonal Architecture:
- **UI / App Layer** (`src/app`, `src/components`, `src/hooks`)
- **Services** (`src/services` — бизнес-логика)
- **Repositories** (`src/repositories` — доступ к данным)
- **Domain** (`src/domain` — сущности и бизнес-правила)
- **Infrastructure / DB** (`src/db` — схема БД и подключение)

Внедрение зависимостей (Dependency Injection) частично реализовано через `src/lib/container.ts`.

---

## 1. Прямой доступ к базе данных из слоя UI/API (App Layer)
**Правило:** Слой UI и API не должен напрямую зависеть от базы данных (инфраструктуры). Все запросы должны идти через слой Services.
**Статус:** ⚠️ **ЕСТЬ НАРУШЕНИЯ**

Некоторые API-роуты (особенно в админке) напрямую импортируют `db` и `schema`.

**Файлы с нарушениями:**
```typescript
src/app/api/health/route.ts
src/app/api/seed/route.ts
src/app/api/admin/questions/bulk/route.ts
src/app/api/admin/questions/[id]/route.ts
src/app/api/admin/questions/route.ts
src/app/api/admin/questions/generate/route.ts
src/app/api/admin/sessions/route.ts
src/app/api/admin/stats/route.ts
src/app/api/admin/users/[id]/route.ts
src/app/api/admin/users/route.ts
src/app/api/admin/universities/bulk/route.ts
src/app/api/admin/universities/[id]/route.ts
src/app/api/admin/universities/route.ts
src/app/api/admin/upload/route.ts
```

**Рекомендация:**
Для поддержания чистоты архитектуры логику работы с БД в этих роутах стоит перенести в соответствующие сервисы (`analytics.service.ts`, `users.service.ts`, `questions.service.ts` и т.д.) и использовать репозитории. Однако, для прагматичного подхода в Next.js (если это только простые `GET` запросы), это может быть допустимым компромиссом для скорости разработки. Но для мутаций (POST, PUT, DELETE) лучше использовать сервисы.

---

## 2. Зависимости сервисов от БД (Infrastructure Leak)
**Правило:** Сервисы (бизнес-логика) должны зависеть только от Domain и абстракций репозиториев, но не от самой базы данных или ORM.
**Статус:** ✅ **ОТЛИЧНО**

В директории `src/services/` нет ни одного прямого импорта из `@/db`. Все сервисы корректно используют репозитории.

---

## 3. Доступ к репозиториям в обход сервисов (из App Layer)
**Правило:** Слой UI/API должен общаться только с сервисами.
**Статус:** ✅ **ОТЛИЧНО**

В `src/app/` нет прямых обращений к `src/repositories/`. Взаимодействие происходит через сервисы, получаемые из `src/lib/container.ts`.

---

## 4. UI-компоненты и хуки
**Статус:** ✅ **ОТЛИЧНО**

В `src/components/` и `src/hooks/` архитектура соблюдается: нет прямого доступа к репозиториям или базе данных.

---

## Вывод
Архитектура проекта в целом очень хорошая и соблюдает принципы Clean Architecture.

Единственная область для улучшения — это админские API-роуты (`src/app/api/admin/*`), где инфраструктура (Drizzle ORM и `db`) протекает в слой контроллеров/роутов. В рамках строгого Clean Architecture это нужно отрефакторить. В рамках прагматичного подхода (если это не мешает тестированию и переиспользованию логики) с этим можно жить, но мутации лучше все же вынести в сервисы.
