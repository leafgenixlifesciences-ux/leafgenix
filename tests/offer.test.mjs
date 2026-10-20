import assert from "node:assert/strict";
import { test } from "node:test";

import { COUPON, couponFormatValid, couponPricePaise, priceLines } from "../src/lib/offer.ts";

test("welcome offer remains 10 percent", () => {
  assert.equal(couponPricePaise(10000, COUPON.code), 9000);
});

test("admin coupon percentages price every unit", () => {
  const offer = { code: "WELLNESS15", percent: 15 };
  assert.equal(couponPricePaise(53900, offer), 45815);
  assert.deepEqual(priceLines([{ mrpPaise: 53900, quantity: 2 }], offer), {
    subtotalPaise: 91630,
    listTotalPaise: 107800,
    discountPaise: 16170,
  });
});

test("malformed or out-of-range coupons never discount", () => {
  assert.equal(couponFormatValid("A"), false);
  assert.equal(couponFormatValid("LEAF_25"), true);
  assert.equal(couponPricePaise(10000, { code: "BAD", percent: 100 }), 10000);
});
