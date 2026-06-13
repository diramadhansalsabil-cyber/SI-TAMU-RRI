import { Visitor } from "@/types";
import { format, subDays, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function computeVisitorStats(visitors: Visitor[]) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const today = visitors.filter(
    (v) => new Date(v.waktu_kedatangan) >= todayStart
  ).length;

  const week = visitors.filter(
    (v) => new Date(v.waktu_kedatangan) >= weekStart
  ).length;

  const month = visitors.filter(
    (v) => new Date(v.waktu_kedatangan) >= monthStart
  ).length;

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(now, 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const count = visitors.filter((v) => {
      const visitDate = new Date(v.waktu_kedatangan);
      return visitDate >= dayStart && visitDate <= dayEnd;
    }).length;

    return {
      date: format(date, "dd MMM", { locale: localeId }),
      count,
    };
  });

  return { today, week, month, total: visitors.length, chartData };
}
