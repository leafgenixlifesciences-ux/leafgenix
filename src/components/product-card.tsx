import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AddToCart } from "@/components/add-to-cart";
import { formatPaise } from "@/lib/money";
import { categoryAccent } from "@/lib/category-accent";
import type { Product } from "@/lib/types";

/**
 * One product, one card. The photograph carries the card: a tall tinted
 * frame with the pack sitting on the category's colour, a single small
 * category chip, and nothing else competing with it. Text below is kept to
 * name, one line, meta, price, button.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const soldOut = product.stock <= 0;
  const spot = categoryAccent(product.category);

  return (
    <article
      className="tile group flex h-full flex-col"
      style={{ "--spot": spot } as React.CSSProperties}
    >
      <Link
        href={`/products/${product.slug}`}
        className="focus-ring tile__frame block aspect-4/5"
        aria-label={`${product.name} — ${product.tagline ?? ""}`}
      >
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={`${product.name}, ${product.pack_size}`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 30vw"
            className="object-cover"
          />
        )}

        <span
          className="absolute top-4 left-4 rounded-full bg-white/85 px-2.5 py-1 text-[0.625rem] font-extrabold tracking-[0.1em] uppercase backdrop-blur"
          style={{ color: spot }}
        >
          {product.category}
        </span>

        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-white/72 backdrop-blur-[1px]">
            <span className="display-sm text-muted">Sold out</span>
          </div>
        )}

        <span className="absolute right-4 bottom-4 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-white text-brand opacity-0 shadow-md transition-all duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-5">
        <h3 className="display-sm text-[1.3125rem]">
          <Link
            href={`/products/${product.slug}`}
            className="focus-ring transition-colors hover:text-brand"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-1.5 line-clamp-2 text-[0.9375rem] leading-relaxed text-body">
          {product.tagline}
        </p>

        <p className="num mt-2.5 text-xs text-muted">
          {product.form}
          {product.pack_size ? ` · ${product.pack_size}` : ""}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="stat-num text-[1.5rem] text-brand-deep">
              {formatPaise(product.mrp_paise)}
            </span>
          </div>

          <div className="mt-4">
            <AddToCart product={product} variant="compact" className="w-full" />
          </div>
        </div>
      </div>
    </article>
  );
}
