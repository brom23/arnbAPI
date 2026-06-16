import { z } from "zod";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const toTime = (date: string) =>
  new Date(`${date}T00:00:00.000Z`).getTime();

export const dateRangeValidator = z
  .object({
    from: z.string(),
    to: z.string(),
  })
  .superRefine((data, ctx) => {

    if (!isoDateRegex.test(data.from)) {
      ctx.addIssue({
        path: ["from"],
        code: z.ZodIssueCode.custom,
        message: "Invalid ISO date format (YYYY-MM-DD)",
      });
      return;
    }

    if (!isoDateRegex.test(data.to)) {
      ctx.addIssue({
        path: ["to"],
        code: z.ZodIssueCode.custom,
        message: "Invalid ISO date format (YYYY-MM-DD)",
      });
      return;
    }

    const fromTime = toTime(data.from);
    const toTimeVal = toTime(data.to);

    if (fromTime > toTimeVal) {
      ctx.addIssue({
        path: ["to"],
        code: z.ZodIssueCode.custom,
        message: "'to' must be greater than or equal to 'from'",
      });
    }
  });