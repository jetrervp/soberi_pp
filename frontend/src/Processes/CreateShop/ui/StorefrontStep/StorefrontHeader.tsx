import { Link, NavLink } from "react-router-dom"
import styles from "./Storefront.module.scss"

export default function StorefrontHeader({ name, logo, count, storePath, onOpenCart, onHome }: {
    name: string; logo?: string | null; count: number; storePath?: string; onOpenCart: () => void; onHome: () => void
}) {
    const cartLabel = <>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 4h2l2.4 11h11l2-8H6M9 19h.01M17 19h.01" />
            <circle cx="9" cy="19" r="1" /><circle cx="17" cy="19" r="1" />
        </svg>
        Корзина <span className={styles.cartCount} aria-live="polite">{count}</span>
    </>

    const brand = <>{logo && <img src={logo} alt="" />}{name}</>

    return <header className={styles.storeHeader}>
        <h1>{storePath ? <Link className={styles.brand} to={storePath}>{brand}</Link>
            : <button type="button" className={styles.brand} onClick={onHome}>{brand}</button>}</h1>
        {storePath ? <NavLink end className={styles.action} to={`${storePath}/cart`}>{cartLabel}</NavLink>
            : <button type="button" className={styles.action} onClick={onOpenCart}>{cartLabel}</button>}
    </header>
}
