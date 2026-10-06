import Link from "next/link";

export default function NotFoundPage() {
  return <section className="not-found"><span className="eyebrow">PÁGINA NO ENCONTRADA</span><h1>Nos desviamos<br /><em>entre páginas.</em></h1><Link href="/" className="button button-primary">Volver al inicio <span aria-hidden="true">→</span></Link></section>;
}
