# Cookbook: Greenline Charts

Стандарты уровня senior: предсказуемая архитектура, минимум дублирования, переиспользуемые чистые компоненты.

## Стек

- Vue 3, `<script setup lang="ts">`, Composition API
- TypeScript (strict)
- PrimeVue 4 — UI из библиотеки, не копировать стили Prime в свои компоненты без необходимости
- Vite, алиасы `@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`

## Feature-Sliced Design (FSD)

Слои (сверху вниз — только импорт «вниз»):

| Слой      | Назначение                                      |
|-----------|--------------------------------------------------|
| `app`     | Инициализация, провайдеры, корневой `App.vue`   |
| `pages`   | Страницы, композиция виджетов и фич             |
| `widgets` | Крупные блоки UI (дашборд, сайдбар)             |
| `features`| Пользовательские сценарии (действия, формы)     |
| `entities`| Бизнес-сущности (модели, карточки сущности)       |
| `shared`  | UI-kit, стили, утилиты, конфиг без домена       |

### Правила импортов

1. Слой импортирует только из слоёв **ниже** (pages → widgets/features/entities/shared).
2. **Запрещены** cross-import между слайсами одного слоя (например, `features/a` → `features/b`). Общее — в `shared` или поднять композицию на `pages` / `widgets`.
3. Публичный API слайса — только через `index.ts` в корне слайса. Внутренние папки (`ui`, `model`, `api`) не импортируются снаружи напрямую.

### Структура слайса

```
feature-name/
  index.ts          # public API
  ui/
    FeatureName.vue
  model/            # composables, store, types — по необходимости
  api/              # HTTP — по необходимости
```

## Single File Component (SFC)

**Порядок блоков (обязательно):**

1. `<template>`
2. `<script setup lang="ts">`
3. `<style scoped>` (или отдельный CSS-модуль, если стилей много)

## Стили

- Глобальные токены и reset: `src/shared/styles/` (`tokens.css`, `base.css`, `index.css`).
- В компонентах — `scoped` стили и CSS-переменные из токенов; не хардкодить цвета/отступы, если есть токен.
- Повторяющиеся паттерны (сетки, типографика блоков) — в `shared/ui`, не копировать в каждую страницу.
- PrimeVue: кастомизация через theme preset (`app/providers`), не дублировать компоненты Prime «с нуля».

## Компоненты

- **Умные** (containers): страницы, виджеты, фичи — знают о данных и сценариях.
- **Глупые** (presentational): `shared/ui` — только props/emits/slots, без прямых API-вызовов.
- Один компонент — одна ответственность; выносить подкомпоненты в тот же слайс (`ui/`) или в `shared/ui`, если переиспользуется ≥2 раз.
- Имена: `PascalCase` для файлов `.vue`, `defineOptions({ name: '...' })` совпадает с именем файла.
- Props: явные типы, `defineProps` + при необходимости `withDefaults`; события — `defineEmits` с типами.
- Избегать `any`; предпочитать `interface` для публичных контрактов.

## TypeScript

- Strict mode, без неиспользуемых переменных.
- Логика вынесена в composables (`model/useX.ts`) при росте `<script>`.
- Типы домена — рядом с entity/feature, общие примитивы — `shared/lib` или `shared/types`.

## PrimeVue

- Регистрация темы и плагина — только в `app/providers`.
- Импорт компонентов точечно: `import Button from 'primevue/button'` (tree-shaking).
- Иконки: `primeicons`, классы `pi pi-*`.

## Дублирование

Перед копированием кода: можно ли положить в `shared`? Можно ли параметризовать props/slots? Если логика совпадает — composable в `model/` слайса или `shared/lib`.

## Коммиты и качество

- `npm run build` должен проходить перед merge.
- Новый слайс — с `index.ts` и минимальным README в `docs/` только если нужен onboarding (не обязателен для каждой фичи).
