import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { getBondization } from "../../shared/bond-analytics.js";
import { formatJson } from "../../shared/formatter.js";
import { mapPool } from "../../shared/map-pool.js";
import { addMonthsIso, parseIsoDate, todayIso } from "../../shared/stats.js";
import { getCashflowCalendarSchema } from "./schema.js";

export const getCashflowCalendarToolName = "get_cashflow_calendar";

export const getCashflowCalendarToolDescription =
  "Portfolio coupon + offer cashflow calendar over 12–24 months. Sums coupon RUB and offer notional by month from ISS bondization.";

export const getCashflowCalendarToolSchema = getCashflowCalendarSchema;

interface CashflowEvent {
  date: string;
  month: string;
  security: string;
  type: "coupon" | "offer";
  quantity: number;
  per_bond: number | null;
  amount: number | null;
  currency: string | null;
  meta: Record<string, unknown>;
}

export function createGetCashflowCalendarHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getCashflowCalendarSchema.parse(args);
    const from = params.from ?? todayIso();
    const till = addMonthsIso(from, params.horizon_months);
    const fromD = parseIsoDate(from)!;
    const tillD = parseIsoDate(till)!;

    const perSecurity = await mapPool(params.holdings, 5, async (h) => {
      try {
        const bondization = await getBondization(client, h.security);
        const events: CashflowEvent[] = [];

        for (const c of bondization.coupons) {
          const date = String(c.coupondate ?? "").slice(0, 10);
          const d = parseIsoDate(date);
          if (!d || d < fromD || d > tillD) continue;
          const perBond = c.value_rub != null ? Number(c.value_rub) : c.value != null ? Number(c.value) : null;
          const amount = perBond != null && Number.isFinite(perBond) ? perBond * h.quantity : null;
          events.push({
            date,
            month: date.slice(0, 7),
            security: h.security,
            type: "coupon",
            quantity: h.quantity,
            per_bond: perBond,
            amount,
            currency: c.faceunit != null ? String(c.faceunit) : "RUB",
            meta: {
              valueprc: c.valueprc ?? null,
              facevalue: c.facevalue ?? null,
              recorddate: c.recorddate ?? null,
            },
          });
        }

        for (const o of bondization.offers) {
          const date = String(o.offerdate ?? "").slice(0, 10);
          const d = parseIsoDate(date);
          if (!d || d < fromD || d > tillD) continue;
          const pricePct = o.price != null ? Number(o.price) : 100;
          const face = o.facevalue != null ? Number(o.facevalue) : 1000;
          const perBond =
            Number.isFinite(pricePct) && Number.isFinite(face) ? (pricePct / 100) * face : null;
          const amount = perBond != null ? perBond * h.quantity : null;
          events.push({
            date,
            month: date.slice(0, 7),
            security: h.security,
            type: "offer",
            quantity: h.quantity,
            per_bond: perBond,
            amount,
            currency: o.faceunit != null ? String(o.faceunit) : "RUB",
            meta: {
              offertype: o.offertype ?? null,
              price_pct: o.price ?? null,
              facevalue: o.facevalue ?? null,
            },
          });
        }

        events.sort((a, b) => a.date.localeCompare(b.date));
        return { security: h.security, quantity: h.quantity, ok: true as const, events };
      } catch (err) {
        return {
          security: h.security,
          quantity: h.quantity,
          ok: false as const,
          error: err instanceof Error ? err.message : String(err),
          events: [] as CashflowEvent[],
        };
      }
    });

    const events = perSecurity.flatMap((s) => s.events).sort((a, b) => a.date.localeCompare(b.date));

    const byMonthMap = new Map<
      string,
      { month: string; coupon_amount: number; offer_amount: number; events: number }
    >();
    for (const e of events) {
      const row = byMonthMap.get(e.month) ?? {
        month: e.month,
        coupon_amount: 0,
        offer_amount: 0,
        events: 0,
      };
      row.events += 1;
      if (e.amount != null) {
        if (e.type === "coupon") row.coupon_amount += e.amount;
        else row.offer_amount += e.amount;
      }
      byMonthMap.set(e.month, row);
    }
    const by_month = [...byMonthMap.values()].sort((a, b) => a.month.localeCompare(b.month));

    const totals = {
      coupon_amount: by_month.reduce((s, m) => s + m.coupon_amount, 0),
      offer_amount: by_month.reduce((s, m) => s + m.offer_amount, 0),
      events: events.length,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: formatJson({
            from,
            till,
            horizon_months: params.horizon_months,
            holdings: params.holdings.length,
            totals,
            by_month,
            events,
            securities: perSecurity.map(({ security, quantity, ok, error }) => ({
              security,
              quantity,
              ok,
              error: error ?? null,
            })),
          }),
        },
      ],
    };
  };
}
