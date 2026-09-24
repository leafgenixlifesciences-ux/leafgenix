/** Everything in this codebase stores money as an integer number of paise.
 *  Razorpay expects paise too, so there is never a float in the money path. */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrWithPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPaise(paise: number): string {
  return paise % 100 === 0
    ? inr.format(paise / 100)
    : inrWithPaise.format(paise / 100);
}

export function rupees(paise: number): number {
  return paise / 100;
}

export function discountPercent(mrpPaise: number, pricePaise: number): number {
  if (!mrpPaise || mrpPaise <= pricePaise) return 0;
  return Math.round(((mrpPaise - pricePaise) / mrpPaise) * 100);
}
