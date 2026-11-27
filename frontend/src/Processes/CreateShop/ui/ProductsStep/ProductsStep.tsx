import { useEffect, useState } from "react"
import ConfirmDialog from "../../../../widgets/UI/ConfirmDialog"
import { formatPrice } from "../../model/CreateShopModel"
import CategoryEditor from "./CategoryEditor"
import ProductForm from "./ProductForm"
import ProductCard from "./ProductCard"
import type { SizeMode } from "./SizePicker"
import type { Category, Product } from "../../model/CreateShopTypes"
import styles from "./ProductsStep.module.scss"

const emptyProduct = (): Product => ({ key: crypto.randomUUID(), name: "", description: "", price: null, stock: 0, sizes: [] })

export default function ProductsStep({ products, categories, inventory = false, onCreateCategory, onChange, upload, register, onError }: {
    inventory?: boolean; products: Product[]; categories: Category[]; onChange: (products: Product[]) => void
    onCreateCategory: (name: string) => Promise<Category>
    upload: (file: File) => Promise<Pick<Product, "photoId" | "photo">>
    register: (commit: (() => Product[]) | null) => void
    onError: (error: unknown) => void
}) {
    const [product, setProduct] = useState(emptyProduct)
    const [mode, setMode] = useState<SizeMode>("none")
    const [price, setPrice] = useState("")
    const [stock, setStock] = useState<{ value: string; baseline?: number }>()
    const [showForm, setShowForm] = useState(true)
    const [removing, setRemoving] = useState<Product>()
    const editedProduct = products.find(item => item.key === product.key)
    const editing = !!editedProduct
    const stockValue = stock?.value ?? (editedProduct ? String(editedProduct.stock) : "")
    const visibleProducts = inventory ? products.filter(item => item.stock > 0) : products

    function commit() {
        if (!showForm) return products
        const amount = price ? Math.round(Number(price.replaceAll(" ", "").replace(",", ".")) * 100) : null
        if (amount !== null && amount > 2147483647) throw new Error("Цена превышает допустимый предел")
        if (editedProduct && stock && stock.baseline !== editedProduct.stock)
            throw new Error("Остаток изменился после заказа. Проверьте количество и введите его ещё раз.")
        const quantity = Number(stockValue)
        if (!Number.isInteger(quantity) || quantity < 0 || quantity > 2147483647)
            throw new Error("Остаток должен быть целым числом от 0 до 2 147 483 647")
        const value = { ...product, name: product.name.trim(), description: product.description.trim(), price: amount, stock: quantity }
        if (editing) return products.map(item => item.key === value.key ? value : item)
        if (!value.name && !value.description && amount === null && !quantity && !value.sizes.length && !value.photoId) return products
        if (products.length >= 50) throw new Error("Можно добавить до 50 товаров")
        return [...products, value]
    }

    useEffect(() => {
        register(commit)
        return () => register(null)
    })

    function resetForm(close: boolean) {
        setProduct(emptyProduct())
        setMode("none")
        setPrice("")
        setStock(undefined)
        setShowForm(!close)
    }

    return <section>
        <h1>{showForm ? editing ? "Редактирование товара" : "Добавление товара" : "Товары"}</h1>
        {showForm ? <>
            <ProductForm key={product.key} product={product} categories={categories} mode={mode} price={price} stock={stockValue}
                onChange={value => setProduct(current => ({ ...current, ...value }))}
                onSizes={(type, sizes) => { setMode(type); setProduct(current => ({ ...current, sizes })) }}
                onPrice={setPrice} onStock={value => setStock({ value, baseline: editedProduct?.stock })} onPhoto={async file => {
                    const key = product.key
                    try {
                        const photo = await upload(file)
                        setProduct(current => current.key === key ? { ...current, ...photo } : current)
                    } catch (error) {
                        onError(error)
                    }
                }} />
            <div className={styles.formActions}>
                <button type="button" className={styles.secondary} onClick={() => resetForm(true)}>Отмена</button>
                <button type="button" className={styles.saveProduct} onClick={() => {
                    try {
                        const next = commit()
                        if (next === products) throw new Error("Заполните данные товара")
                        onChange(next)
                        resetForm(editing)
                    } catch (error) { onError(error) }
                }}>Сохранить товар</button>
            </div>
        </> : <button type="button" onClick={() => setShowForm(true)}>Добавить товар</button>}
        <details className={styles.categories}>
            <summary>Категории товаров</summary>
            <CategoryEditor categories={categories} onCreate={onCreateCategory}
                onSelect={categoryId => setProduct(current => ({ ...current, categoryId }))} onError={onError} />
        </details>
        {inventory && <h2 className={styles.inventoryTitle}>Товары в наличии</h2>}
        {inventory && !visibleProducts.length && <p>Товаров в наличии пока нет.</p>}
        <div className={styles.cards}>
            {visibleProducts.map(item => <ProductCard key={item.key} product={item} onEdit={() => {
                setShowForm(true)
                setProduct(item)
                setStock(undefined)
                setPrice(item.price === null ? "" : formatPrice((item.price / 100).toFixed(2)))
                setMode(item.sizes.length ? (/^\d/.test(item.sizes[0]) ? "shoes" : "clothes") : "none")
            }} onRemove={() => setRemoving(item)} />)}
        </div>
        {removing && <ConfirmDialog title="Удалить товар?"
            message={`Товар «${removing.name || "Без названия"}» исчезнет из списка и витрины.`}
            confirmLabel="Удалить" danger onCancel={() => setRemoving(undefined)} onConfirm={() => {
                onChange(products.filter(item => item.key !== removing.key))
                if (removing.key === product.key) resetForm(false)
                setRemoving(undefined)
            }} />}
    </section>
}
