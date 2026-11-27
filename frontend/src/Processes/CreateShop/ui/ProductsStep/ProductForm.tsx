import { useId } from "react"
import { Input } from "../../../../widgets/UI"
import { formatPrice } from "../../model/CreateShopModel"
import type { Category, Product } from "../../model/CreateShopTypes"
import SizePicker, { type SizeMode } from "./SizePicker"
import styles from "./ProductsStep.module.scss"

export default function ProductForm({ product, categories, mode, price, stock, onChange, onSizes, onPrice, onStock, onPhoto }: {
    product: Product; categories: Category[]; mode: SizeMode; price: string; stock: string
    onChange: (value: Partial<Product>) => void
    onSizes: (mode: SizeMode, sizes: string[]) => void
    onPrice: (value: string) => void
    onStock: (value: string) => void
    onPhoto: (file: File) => void
}) {
    const photoId = useId()
    const category = categories.find(item => item.id === product.categoryId)
    const name = product.name.trim()

    return <div className={styles.productLayout}>
        <div className={styles.productFields}>
            <label>Название <Input placeholder="Введите название" maxLength={100} value={product.name}
                onChange={name => onChange({ name })} /></label>
            <label>Категория <select value={product.categoryId ?? ""}
                onChange={event => onChange({ categoryId: Number(event.currentTarget.value) || null })}>
                <option value="">Выберите категорию</option>
                {categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select></label>
            <div className={styles.numbers}>
                <label>Цена, руб.
                    <Input inputMode="decimal" placeholder="0" maxLength={16} value={price}
                        onChange={value => onPrice(formatPrice(value))} />
                </label>
                <label>Остаток
                    <Input inputMode="numeric" placeholder="0" maxLength={10} value={stock}
                        onChange={value => { if (/^\d*$/.test(value)) onStock(value) }} />
                </label>
            </div>
            <label>Описание <textarea placeholder="Опишите товар" maxLength={1000} value={product.description}
                onChange={event => onChange({ description: event.currentTarget.value })} /></label>
            <button type="button" className={styles.secondary} disabled={!name || !!product.description.trim()}
                onClick={() => onChange({ description: category
                    ? `«${name}» — товар из категории «${category.name}».`
                    : `«${name}» — товар из ассортимента нашего магазина.`
                })}>Предложить описание</button>
            <details className={styles.sizeOptions}>
                <summary>{product.sizes.length ? `Размеры: ${product.sizes.join(", ")}` : "Настроить размеры"}</summary>
                <SizePicker mode={mode} sizes={product.sizes} onChange={onSizes} />
            </details>
        </div>

        <section className={styles.photoPanel}>
            <h2>Фотография товара</h2>
            {product.photo && <img className={styles.previewPhoto} src={product.photo} alt="Фото товара" />}
            <input className={styles.fileInput} id={photoId} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                aria-label="Загрузить фото товара" onChange={event => {
                    const file = event.currentTarget.files?.[0]
                    if (file) onPhoto(file)
                    event.currentTarget.value = ""
                }} />
            <label className={styles.upload} htmlFor={photoId}>{product.photo ? "Заменить фото" : "Загрузить фото"}</label>
            {product.photo && <button type="button" className={styles.secondary}
                onClick={() => onChange({ photo: null, photoId: null })}>Убрать фото</button>}
        </section>
    </div>
}
