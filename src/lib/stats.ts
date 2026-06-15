import { Visitor } from "@/types";
import { format, subDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { APP_TIMEZONE, startOfDayInAppTimezone } from "@/lib/utils";

function getZonedParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

function startOfWeekInAppTimezone(date: Date): Date {
  const parts = getZonedParts(date);
  const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
  });
  const weekday = weekdayFormatter.format(date);
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const mondayOffset = weekdayIndex === 0 ? -6 : 1 - weekdayIndex;
  const monday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + mondayOffset, -8, 0, 0, 0));
  return monday;
}

function startOfMonthInAppTimezone(date: Date): Date {
  const parts = getZonedParts(date);
  return new Date(Date.UTC(parts.year, parts.month - 1, 1, -8, 0, 0, 0));
}

export function computeVisitorStats(visitors: Visitor[]) {
  const now = new Date();
  const todayStart = startOfDayInAppTimezone(now);
  const weekStart = startOfWeekInAppTimezone(now);
  const monthStart = startOfMonthInAppTimezone(now);

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
    const dayStart = startOfDayInAppTimezone(subDays(now, 6 - i));
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

    const count = visitors.filter((v) => {
      const visitDate = new Date(v.waktu_kedatangan);
      return visitDate >= dayStart && visitDate <= dayEnd;
    }).length;

    const labelDate = new Date(dayStart.getTime() + 8 * 60 * 60 * 1000);
    return {
      date: format(labelDate, "dd MMM", { locale: localeId }),
      count,
    };
  });

  return { today, week, month, total: visitors.length, chartData };
}
