# Greenline Charts

Vue 3 + TypeScript + PrimeVue с архитектурой Feature-Sliced Design.

## Быстрый старт

```bash
npm install
npm run dev
```

## Документация

- [Cookbook (стандарты разработки)](./docs/COOKBOOK.md)
- Правила для Cursor: `.cursor/rules/vue-fsd-cookbook.mdc`

## Структура `src`

```
app/          — точка входа, провайдеры, App.vue
pages/        — страницы
widgets/      — крупные блоки UI
features/     — пользовательские сценарии
entities/     — бизнес-сущности
shared/       — ui-kit, глобальные стили, утилиты
```

## Скрипты

| Команда        | Описание              |
|----------------|-----------------------|
| `npm run dev`  | Dev-сервер            |
| `npm run build`| Проверка типов + сборка |
| `npm run preview` | Превью production |
