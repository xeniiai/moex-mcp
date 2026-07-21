import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatJson } from "../../shared/formatter.js";
import { mapPool } from "../../shared/map-pool.js";
import { median, todayIso } from "../../shared/stats.js";
import { getHistory } from "../get-history/query.js";
import { getMarketData } from "../get-market-data/query.js";
import { getLiquidityStatsSchema } from "./schema.js";

export const getLiquidityStatsToolName = "get_liquidity_stats";

export const getLiquidityStatsToolDescription =
  "Liquidity over a period from ISS history: turnover, trading days, zero-trade days, median daily value, median high-low range. Plus current BID/OFFER from marketdata (ISS has no EOD bid/ask history).";

export const getLiquidityStatsToolSchema = getLiquidityStatsSchema;

export function createGetLiquidityStatsHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getLiquidityStatsSchema.parse(args);
    const till = params.till ?? todayIso();

    const items = await mapPool(params.securities, 4, async (security) => {
      try {
        const page = await getHistory(client, {
          security,
          engine: params.engine,
          market: params.market,
          board: params.board,
          from: params.from,
          till,
          limit: 2000,
          start: 0,
        });
        const rows = page.rows;
        const tradingDays = rows.length;
        const zeroTradeDays = rows.filter(
          (r) => Number(r.NUMTRADES) === 0 || Number(r.VALUE) === 0 || r.VALUE == null,
        ).length;
        const values = rows
          .map((r) => Number(r.VALUE))
          .filter((n) => Number.isFinite(n) && n > 0);
        const volumes = rows
          .map((r) => Number(r.VOLUME))
          .filter((n) => Number.isFinite(n) && n > 0);
        const ranges = rows
          .map((r) => {
            const low = Number(r.LOW);
            const high = Number(r.HIGH);
            const close = Number(r.CLOSE);
            if (![low, high, close].every(Number.isFinite) || close === 0) return null;
            return ((high - low) / close) * 100;
          })
          .filter((n): n is number => n != null);

        let bidAsk: {
          bid: number | null;
          offer: number | null;
          spread_abs: number | null;
          spread_pct: number | null;
          board: string | null;
        } = { bid: null, offer: null, spread_abs: null, spread_pct: null, board: null };

        try {
          const md = await getMarketData(client, {
            security,
            engine: params.engine,
            market: params.market,
            board: params.board,
          });
          const quote =
            (params.board
              ? md.marketdata.find((r) => String(r.BOARDID) === params.board)
              : null) ??
            md.marketdata.find((r) => String(r.BOARDID) === "TQCB") ??
            md.marketdata[0];
          if (quote) {
            const bid = quote.BID != null ? Number(quote.BID) : null;
            const offer = quote.OFFER != null ? Number(quote.OFFER) : null;
            const spread_abs =
              bid != null && offer != null && Number.isFinite(bid) && Number.isFinite(offer)
                ? offer - bid
                : null;
            const mid = bid != null && offer != null ? (bid + offer) / 2 : null;
            bidAsk = {
              bid: bid != null && Number.isFinite(bid) ? bid : null,
              offer: offer != null && Number.isFinite(offer) ? offer : null,
              spread_abs,
              spread_pct: spread_abs != null && mid ? (spread_abs / mid) * 100 : null,
              board: quote.BOARDID != null ? String(quote.BOARDID) : null,
            };
          }
        } catch {
          /* marketdata optional */
        }

        const totalValue = values.reduce((s, v) => s + v, 0);
        return {
          security,
          ok: true as const,
          from: params.from,
          till,
          trading_days: tradingDays,
          zero_trade_days: zeroTradeDays,
          zero_trade_share: tradingDays ? zeroTradeDays / tradingDays : null,
          turnover_value: totalValue,
          avg_daily_value: values.length ? totalValue / values.length : null,
          median_daily_value: median(values),
          median_daily_volume: median(volumes),
          median_high_low_pct: median(ranges),
          current_bid_ask: bidAsk,
          has_more_history: page.has_more,
        };
      } catch (err) {
        return {
          security,
          ok: false as const,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    return {
      content: [
        {
          type: "text" as const,
          text: formatJson({
            engine: params.engine,
            market: params.market,
            board: params.board ?? null,
            from: params.from,
            till,
            count: items.length,
            items,
            note: "current_bid_ask is live marketdata; ISS history has no EOD bid/ask — use median_high_low_pct as range proxy",
          }),
        },
      ],
    };
  };
}
