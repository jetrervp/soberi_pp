import { useState } from "react"
import type { Product } from "../../model/CreateShopTypes"
import type { useStorefrontCart } from "./useStorefrontCart"
import styles from "./Storefront.module.scss"

export default function StorefrontProduct({ product, cart }: { product: Product; cart: ReturnType<typeof useStorefrontCart> }) {
    const [size, setSize] = useState("")
    const [added, setAdded] = useState(false)
    const title = product.name || "Товар без названия"
    const canAdd = cart.canAdd(product)

    return <section className={styles.productDetail} aria-label={title}>
        {product.photo && <img className={styles.detailPhoto} src={product.photo} alt={title} />}
        <div className={styles.detailInfo}>
            <h2>{title}</h2>
            {product.description && <p className={styles.description}>{product.description}</p>}
            {product.price !== null && <p className={styles.detailPrice}>{(product.price / 100).toLocaleString("ru-RU")} ₽</p>}
            {product.sizes.length > 0 && <label>Размер
                <select value={size} onChange={event => { setSize(event.currentTarget.value); setAdded(false) }}>
                    <option value="">Выберите размер</option>
                    {product.sizes.map(option => <option value={option} key={option}>{option}</option>)}
                </select>
            </label>}
            <button type="button" className={styles.action} disabled={!canAdd || (product.sizes.length > 0 && !size)} onClick={() => {
                cart.change(product, 1, size || undefined)
                setAdded(true)
            }}>{product.price === null ? "Цена не указана" : product.stock <= 0 ? "Нет в наличии" : "В корзину"}</button>
            <p role="status">{added && (size ? `Размер ${size} добавлен в корзину.` : "Товар добавлен в корзину.")}</p>
            {product.price !== null && product.stock > 0 && !canAdd && <p>Достигнут лимит количества для этого товара.</p>}
        </div>
    </section>
}
