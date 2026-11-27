import type { Product } from "../../model/CreateShopTypes"
import styles from "./ProductsStep.module.scss"

export default function ProductCard({ product, onEdit, onRemove }: {
    product: Product; onEdit: () => void; onRemove: () => void
}) {
    return <article className={styles.card}>
        {product.photo && <img className={styles.cover} src={product.photo} alt={product.name || "Фото товара"} />}
        <div className={styles.body}>
            <h2>{product.name || "Товар без названия"}</h2>
            {product.description && <p>{product.description}</p>}
            {product.price !== null && <p className={styles.price}>{(product.price / 100).toLocaleString("ru-RU")} ₽</p>}
            <p>Остаток: {product.stock ?? 0} шт.</p>
            {product.sizes.length > 0 && <p>{product.sizes.join(", ")}</p>}
            <div className={styles.cardActions}>
                <button type="button" onClick={onEdit}>Изменить</button>
                <button type="button" className={styles.remove} onClick={onRemove}>Удалить</button>
            </div>
        </div>
    </article>
}
