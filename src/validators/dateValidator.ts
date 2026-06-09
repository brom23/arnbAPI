import { z } from "zod";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const toTime = (date: string) =>
  new Date(`${date}T00:00:00.000Z`).getTime();

const startOfTodayUtc = () => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).getTime();
};

export const dateValidator = z
  .object({
    from: z.string(),
    to: z.string(),
  })
  .superRefine((data, ctx) => {
    // 🔥 1. FORMAT FIRST (FAIL FAST)

    if (!isoDateRegex.test(data.from)) {
      ctx.addIssue({
        path: ["from"],
        code: z.ZodIssueCode.custom,
        message: "Invalid ISO date format (YYYY-MM-DD)",
      });
      return; // ⛔ STOP EVERYTHING
    }

    if (!isoDateRegex.test(data.to)) {
      ctx.addIssue({
        path: ["to"],
        code: z.ZodIssueCode.custom,
        message: "Invalid ISO date format (YYYY-MM-DD)",
      });
      return; // ⛔ STOP EVERYTHING
    }

    // 🔥 2. BUSINESS RULES ONLY IF FORMAT OK

    const fromTime = toTime(data.from);
    const toTimeVal = toTime(data.to);

    // from not in past
    if (fromTime < startOfTodayUtc()) {
      ctx.addIssue({
        path: ["from"],
        code: z.ZodIssueCode.custom,
        message: "'from' cannot be in the past",
      });
      return;
    }

    // at least 1 night
    if (fromTime >= toTimeVal) {
      ctx.addIssue({
        path: ["to"],
        code: z.ZodIssueCode.custom,
        message: "Minimum stay is 1 night",
      });
      return;
    }
  });