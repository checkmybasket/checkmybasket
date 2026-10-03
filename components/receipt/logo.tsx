import Link from "next/link";

export function BasketMark({ inverse = false }: { inverse?: boolean }) {
  return <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M4 11h24l-3 17H7z" fill={inverse ? "#FFFFFF" : "#D42A24"} />
    <path d="M10 11l6-7 6 7" stroke="#141414" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M11 19l4 4 7-7" stroke={inverse ? "#D42A24" : "#FFFFFF"} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function Logo() {
  return <Link className="receipt-logo" href="/" aria-label="CheckMyBasket home"><BasketMark /><span>CheckMyBasket</span></Link>;
}
