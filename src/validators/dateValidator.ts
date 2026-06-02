import { z } from "zod";

// Regex dokładnie dla YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (value: string) => {
  if (!dateRegex.test(value)) return false;

  const date = new Date(value);
  return !isNaN(date.getTime());
};

export const dateValidator = z
  .object({
    from: z
      .string()
      .refine(isValidDate, {
        message: "Invalid 'from' date format. Use YYYY-MM-DD",
      }),
    to: z
      .string()
      .refine(isValidDate, {
        message: "Invalid 'to' date format. Use YYYY-MM-DD",
      }),
  })
  .refine(
    (data) => {
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);
      return fromDate.getTime() < toDate.getTime();
    },
    {
      message: "'from' must be earlier than 'to'",
      path: ["to"],
    }
  )
  .refine(
    (data) => data.from !== data.to,
    {
      message: "'from' and 'to' cannot be the same",
      path: ["to"],
    }
  );