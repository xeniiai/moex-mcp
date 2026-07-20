# MOEX MCP Server

Форк [cyberash-dev/moex-mcp](https://github.com/cyberash-dev/moex-mcp) с доработками под точечную аналитику (облигации / peer-сравнение).

MCP-сервер для доступа к данным Московской Биржи через [ISS API](https://iss.moex.com/iss/reference/).

## Отличия от upstream (v1.3)

- Streamable HTTP: `TRANSPORT=streamable-http` (k8s), иначе stdio
- `security` **или** `secid` — оба принимаются во всех tools по бумаге
- `get_market_data` **требует** тикер; JSON с `quotes` + `yields`
- `get_market_data_batch` — до 30 бумаг одним вызовом
- `search_securities` / `get_coupons` / `get_security_info` / `get_bond_yield_curve` — JSON по умолчанию
- `get_security_info`: по умолчанию только **primary board**
- исправлен путь ZCYC: `/engines/{engine}/zcyc`

### HTTP (production)

```bash
TRANSPORT=streamable-http HOST=0.0.0.0 PORT=8030 MCP_PATH=/mcp npm start
# health: GET /health
# mcp:    POST/GET/DELETE /mcp
```

Docker image: `ghcr.io/xeniiai/moex-mcp` (CI на push в `main`).


## Требования

- Node.js 18+

## Установка

```bash
git clone <repo-url> moex-mcp
cd moex-mcp
npm install
npm run build
```

## Подключение

### Claude Code

```bash
claude mcp add moex node /path/to/moex-mcp/dist/index.js
```

### Claude Desktop / ручная настройка

Добавить в конфигурацию MCP-серверов:

```json
{
  "mcpServers": {
    "moex": {
      "command": "node",
      "args": ["/path/to/moex-mcp/dist/index.js"]
    }
  }
}
```

## Инструменты (20 шт.)

### Поиск и информация о бумагах

| Инструмент | Описание |
| --- | --- |
| `search_securities` | Поиск бумаг по тикеру, названию или ISIN (JSON) |
| `get_security_info` | Спецификация бумаги; по умолчанию primary board |
| `get_market_data_batch` | Котировки/yields для списка SECID (до 30) |
| `get_security_indices` | Индексы, в которые входит бумага |

### Рыночные данные

| Инструмент | Описание |
| --- | --- |
| `get_market_data` | Текущие данные: цена, объём, bid/ask, изменение |
| `get_orderbook` | Стакан заявок |
| `get_recent_trades` | Последние сделки |
| `get_candles` | OHLCV-свечи (1, 10, 60 мин или дневные) |

### Исторические данные

| Инструмент | Описание |
| --- | --- |
| `get_history` | Итоги торгов за период |
| `get_history_date_range` | Доступный диапазон дат для бумаги |
| `get_historical_candles` | Исторические свечи за период |

### Справочники

| Инструмент | Описание |
| --- | --- |
| `list_engines` | Торговые системы (stock, currency, futures и др.) |
| `list_markets` | Рынки торговой системы |
| `list_boards` | Режимы торгов |

### Аналитика и статистика

| Инструмент | Описание |
| --- | --- |
| `get_index_analytics` | Аналитика индексов, состав и веса (IMOEX, RTSI) |
| `get_currency_rates` | Валютные курсы: фиксинг MOEX, ЦБ РФ, индикативные |
| `get_market_turnovers` | Обороты по рынкам |
| `get_bond_yield_curve` | Кривая бескупонной доходности (ZCYC) |
| `get_futures_open_positions` | Открытые позиции по фьючерсам |

### Корпоративные действия

| Инструмент | Описание |
| --- | --- |
| `get_dividends` | История дивидендных выплат |
| `get_coupons` | График купонных выплат по облигациям |

## Примеры использования

После подключения сервера можно обращаться к данным биржи на естественном языке:

- «Найди акции Сбербанка»
- «Покажи текущую цену GAZP»
- «Дай историю торгов SBER за январь 2025»
- «Какие дивиденды платил Лукойл?»
- «Покажи состав индекса IMOEX»
- «Курс доллара по фиксингу ЦБ»
- «Свечи YNDX за последний месяц с интервалом 1 день»

## Параметры по умолчанию

Большинство инструментов используют значения по умолчанию для удобства:

- `engine` = `"stock"` (фондовый рынок)
- `market` = `"shares"` (акции)

Для работы с другими рынками (облигации, валюта, фьючерсы) укажите параметры явно.

## Аутентификация

Сервер работает без аутентификации. В этом режиме рыночные данные приходят с 15-минутной задержкой. Индексы всегда доступны в реальном времени.

## Архитектура

Vertical Slice + Hexagonal (Ports & Adapters):

```
src/
├── index.ts                    # Composition root
├── server.ts                   # Регистрация MCP-инструментов
├── shared/
│   ├── ports/                  # Интерфейсы (порты)
│   ├── adapters/               # Реализации (адаптеры)
│   ├── pagination.ts           # Авто-пагинация
│   └── formatter.ts            # Форматирование для LLM
└── features/                   # 20 вертикальных слайсов
    └── <tool-name>/
        ├── schema.ts           # Zod-схема параметров
        ├── query.ts            # Бизнес-логика запроса
        └── handler.ts          # MCP-обработчик
```

## Лицензия

MIT
