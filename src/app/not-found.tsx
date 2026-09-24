import Link from "next/link";
import { LeafGlyph } from "@/components/brand";

export default function NotFound() {
  return (
    <section className="shell grid min-h-[70vh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <LeafGlyph className="mx-auto h-12 w-12 text-brand/30" />
        <p className="numeral mt-8 text-7xl leading-none text-faint">404</p>
        <h1 className="display-lg mt-4">Nothing grows here.</h1>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-body">
          The page you were after has moved or never existed. The formulations are all still where you left them.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="btn btn-primary">
            See the range
          </Link>
          <Link href="/" className="btn btn-outline">
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
