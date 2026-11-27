import { formatTotal } from "../../../Orders/OrdersApi"
import { Link } from "react-router-dom"
import type { useStorefrontCart } from "./useStorefrontCart"
import styles from "./Storefront.module.scss"

export default function StorefrontCart({ cart, storePath }: {
    cart: ReturnType<typeof useStorefrontCart>; storePath?: string
}) {
    return <section className={styles.cartPage} aria-label="Корзина">
        <div className={styles.cartHeading}>
            <h2>Корзина</h2>
        </div>
        {cart.lines.length === 0 ? <p>Корзина пока пуста.</p> : <>
            <ul className={styles.cartLines}>
                {cart.lines.map(({ key, product, size, quantity }) => {
                    const name = product.name || "Товар без названия"
                    const label = size ? `${name}, размер ${size}` : name
                    return <li key={key} className={styles.cartLine}>
                        <div>
                            {storePath ? <Link className={styles.cartProductLink} to={`${storePath}/products/${encodeURIComponent(product.key)}`}>{name}</Link> : <strong>{name}</strong>}
                            {size && <p>Размер {size}</p>}
                            <p>{formatTotal((product.price ?? 0) * quantity)}</p>
                        </div>
                        <div className={styles.quantity}>
                            <button type="button" className={styles.action} aria-label={`Уменьшить количество: ${label}`}
                                onClick={() => cart.change(product, -1, size)}>−</button>
                            <output aria-label={`Количество: ${label}`}>{quantity}</output>
                            <button type="button" className={styles.action} aria-label={`Увеличить количество: ${label}`}
                                disabled={!cart.canAdd(product)} onClick={() => cart.change(product, 1, size)}>+</button>
                            <button type="button" className={styles.action} aria-label={`Убрать из корзины: ${label}`}
                                onClick={() => cart.remove(product, size)}>Убрать</button>
                        </div>
                    </li>
                })}
            </ul>
            <p className={styles.cartTotal}>Итого <strong>{formatTotal(cart.subtotal)}</strong></p>
            {storePath && <div className={styles.cartCheckout}>
                <Link className={styles.checkoutLink} to={`${storePath}/checkout`}>Оформить заказ</Link>
            </div>}
        </>}
    </section>
}
