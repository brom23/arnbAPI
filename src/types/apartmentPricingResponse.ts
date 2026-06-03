export type ApartmentPriceMap = Record<string, number>;

export type ApartmentPricingResponse = {
  prices: ApartmentPriceMap;
};