"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { QuantityStepper } from "@/components/quantity-stepper";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  variant?: "full" | "compact";
  className?: string;
};

export function AddToCart({ product, variant = "full", className = "" }: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = product.stock <= 0;

  function handleAdd() {
    if (soldOut) return;
    add(
      {
        slug: product.slug,
        id: product.id,
        name: product.name,
        image: product.image_url,
        mrpPaise: product.mrp_paise,
        packSize: product.pack_size,
        stock: product.stock,
      },
      qty,
    );
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleAdd}
        disabled={soldOut}
        className={`btn btn-primary w-full ${className}`}
      >
        {soldOut ? (
          "Sold out"
        ) : justAdded ? (
          <>
            <Check className="h-4 w-4" strokeWidth={2.2} /> Added
          </>
        ) : (
          "Add to bag"
        )}
      </button>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <QuantityStepper value={qty} onChange={setQty} max={product.stock} />
      <button
        onClick={handleAdd}
        disabled={soldOut}
        className="btn btn-primary min-w-[13rem] flex-1"
      >
        {soldOut ? (
          "Sold out"
        ) : justAdded ? (
          <>
            <Check className="h-4 w-4" strokeWidth={2.2} /> Added to bag
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" strokeWidth={1.8} /> Add to bag
          </>
        )}
      </button>
    </div>
  );
}
