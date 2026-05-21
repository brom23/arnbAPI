export const getDatesBetween = (
  startDate: string,
  endDate: string
): string[] => {
  const dates: string[] = [];

  const current = new Date(startDate);
  const end = new Date(endDate);

  // check_out = dzień wyjazdu
  end.setDate(end.getDate() - 1);

  while (current <= end) {
    dates.push(
      current.toISOString().split("T")[0]
    );

    current.setDate(current.getDate() + 1);
  }

  return dates;
};