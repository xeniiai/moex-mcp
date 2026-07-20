import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IssClientPort } from "./shared/ports/iss-client.port.js";

import { searchSecuritiesToolName, searchSecuritiesToolDescription, searchSecuritiesToolSchema, createSearchSecuritiesHandler } from "./features/search-securities/handler.js";
import { getSecurityInfoToolName, getSecurityInfoToolDescription, getSecurityInfoToolSchema, createGetSecurityInfoHandler } from "./features/get-security-info/handler.js";
import { getSecurityIndicesToolName, getSecurityIndicesToolDescription, getSecurityIndicesToolSchema, createGetSecurityIndicesHandler } from "./features/get-security-indices/handler.js";
import { getMarketDataToolName, getMarketDataToolDescription, getMarketDataToolSchema, createGetMarketDataHandler } from "./features/get-market-data/handler.js";
import { getMarketDataBatchToolName, getMarketDataBatchToolDescription, getMarketDataBatchToolSchema, createGetMarketDataBatchHandler } from "./features/get-market-data-batch/handler.js";
import { getOrderbookToolName, getOrderbookToolDescription, getOrderbookToolSchema, createGetOrderbookHandler } from "./features/get-orderbook/handler.js";
import { getRecentTradesToolName, getRecentTradesToolDescription, getRecentTradesToolSchema, createGetRecentTradesHandler } from "./features/get-recent-trades/handler.js";
import { getCandlesToolName, getCandlesToolDescription, getCandlesToolSchema, createGetCandlesHandler } from "./features/get-candles/handler.js";
import { getHistoryToolName, getHistoryToolDescription, getHistoryToolSchema, createGetHistoryHandler } from "./features/get-history/handler.js";
import { getHistoryDateRangeToolName, getHistoryDateRangeToolDescription, getHistoryDateRangeToolSchema, createGetHistoryDateRangeHandler } from "./features/get-history-date-range/handler.js";
import { getHistoricalCandlesToolName, getHistoricalCandlesToolDescription, getHistoricalCandlesToolSchema, createGetHistoricalCandlesHandler } from "./features/get-historical-candles/handler.js";
import { listEnginesToolName, listEnginesToolDescription, listEnginesToolSchema, createListEnginesHandler } from "./features/list-engines/handler.js";
import { listMarketsToolName, listMarketsToolDescription, listMarketsToolSchema, createListMarketsHandler } from "./features/list-markets/handler.js";
import { listBoardsToolName, listBoardsToolDescription, listBoardsToolSchema, createListBoardsHandler } from "./features/list-boards/handler.js";
import { getIndexAnalyticsToolName, getIndexAnalyticsToolDescription, getIndexAnalyticsToolSchema, createGetIndexAnalyticsHandler } from "./features/get-index-analytics/handler.js";
import { getCurrencyRatesToolName, getCurrencyRatesToolDescription, getCurrencyRatesToolSchema, createGetCurrencyRatesHandler } from "./features/get-currency-rates/handler.js";
import { getMarketTurnoversToolName, getMarketTurnoversToolDescription, getMarketTurnoversToolSchema, createGetMarketTurnoversHandler } from "./features/get-market-turnovers/handler.js";
import { getBondYieldCurveToolName, getBondYieldCurveToolDescription, getBondYieldCurveToolSchema, createGetBondYieldCurveHandler } from "./features/get-bond-yield-curve/handler.js";
import { getFuturesOpenPositionsToolName, getFuturesOpenPositionsToolDescription, getFuturesOpenPositionsToolSchema, createGetFuturesOpenPositionsHandler } from "./features/get-futures-open-positions/handler.js";
import { getDividendsToolName, getDividendsToolDescription, getDividendsToolSchema, createGetDividendsHandler } from "./features/get-dividends/handler.js";
import { getCouponsToolName, getCouponsToolDescription, getCouponsToolSchema, createGetCouponsHandler } from "./features/get-coupons/handler.js";

export function createServer(client: IssClientPort): McpServer {
  const server = new McpServer({
    name: "moex-mcp",
    version: "1.3.0",
  });

  const tools = [
    { name: searchSecuritiesToolName, description: searchSecuritiesToolDescription, schema: searchSecuritiesToolSchema, handler: createSearchSecuritiesHandler(client) },
    { name: getSecurityInfoToolName, description: getSecurityInfoToolDescription, schema: getSecurityInfoToolSchema, handler: createGetSecurityInfoHandler(client) },
    { name: getSecurityIndicesToolName, description: getSecurityIndicesToolDescription, schema: getSecurityIndicesToolSchema, handler: createGetSecurityIndicesHandler(client) },
    { name: getMarketDataToolName, description: getMarketDataToolDescription, schema: getMarketDataToolSchema, handler: createGetMarketDataHandler(client) },
    { name: getMarketDataBatchToolName, description: getMarketDataBatchToolDescription, schema: getMarketDataBatchToolSchema, handler: createGetMarketDataBatchHandler(client) },
    { name: getOrderbookToolName, description: getOrderbookToolDescription, schema: getOrderbookToolSchema, handler: createGetOrderbookHandler(client) },
    { name: getRecentTradesToolName, description: getRecentTradesToolDescription, schema: getRecentTradesToolSchema, handler: createGetRecentTradesHandler(client) },
    { name: getCandlesToolName, description: getCandlesToolDescription, schema: getCandlesToolSchema, handler: createGetCandlesHandler(client) },
    { name: getHistoryToolName, description: getHistoryToolDescription, schema: getHistoryToolSchema, handler: createGetHistoryHandler(client) },
    { name: getHistoryDateRangeToolName, description: getHistoryDateRangeToolDescription, schema: getHistoryDateRangeToolSchema, handler: createGetHistoryDateRangeHandler(client) },
    { name: getHistoricalCandlesToolName, description: getHistoricalCandlesToolDescription, schema: getHistoricalCandlesToolSchema, handler: createGetHistoricalCandlesHandler(client) },
    { name: listEnginesToolName, description: listEnginesToolDescription, schema: listEnginesToolSchema, handler: createListEnginesHandler(client) },
    { name: listMarketsToolName, description: listMarketsToolDescription, schema: listMarketsToolSchema, handler: createListMarketsHandler(client) },
    { name: listBoardsToolName, description: listBoardsToolDescription, schema: listBoardsToolSchema, handler: createListBoardsHandler(client) },
    { name: getIndexAnalyticsToolName, description: getIndexAnalyticsToolDescription, schema: getIndexAnalyticsToolSchema, handler: createGetIndexAnalyticsHandler(client) },
    { name: getCurrencyRatesToolName, description: getCurrencyRatesToolDescription, schema: getCurrencyRatesToolSchema, handler: createGetCurrencyRatesHandler(client) },
    { name: getMarketTurnoversToolName, description: getMarketTurnoversToolDescription, schema: getMarketTurnoversToolSchema, handler: createGetMarketTurnoversHandler(client) },
    { name: getBondYieldCurveToolName, description: getBondYieldCurveToolDescription, schema: getBondYieldCurveToolSchema, handler: createGetBondYieldCurveHandler(client) },
    { name: getFuturesOpenPositionsToolName, description: getFuturesOpenPositionsToolDescription, schema: getFuturesOpenPositionsToolSchema, handler: createGetFuturesOpenPositionsHandler(client) },
    { name: getDividendsToolName, description: getDividendsToolDescription, schema: getDividendsToolSchema, handler: createGetDividendsHandler(client) },
    { name: getCouponsToolName, description: getCouponsToolDescription, schema: getCouponsToolSchema, handler: createGetCouponsHandler(client) },
  ];

  for (const tool of tools) {
    server.tool(tool.name, tool.description, tool.schema.shape, tool.handler);
  }

  return server;
}
