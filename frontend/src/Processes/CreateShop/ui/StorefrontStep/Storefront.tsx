import { useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react"
import { Link } from "react-router-dom"
import Checkout from "../../../Orders/Checkout"
import type { CheckoutStore } from "../../../Orders/OrdersApi"
import { blockNames, blockSpan, imageMode } from "../../model/CreateShopModel"
import type { Block, Product } from "../../model/CreateShopTypes"
import { contactIcons } from "./contactIcons"
import { contactFields, contactHref } from "../../model/contacts"
import StorefrontCart from "./StorefrontCart"
import StorefrontHeader from "./StorefrontHeader"
import StorefrontProduct from "./StorefrontProduct"
import { useStorefrontCart } from "./useStorefrontCart"
import styles from "./Storefront.module.scss"

const fonts = {
    "": undefined, sans: "Arial, sans-serif", serif: "Georgia, serif", mono: "Consolas, monospace",
    trebuchet: "Trebuchet MS, sans-serif", times: "Times New Roman, serif",
}

export default function Storefront({ name, logo, cartKey, storePath, productKey, cartPage = false, checkout, refresh, blocks, products, preview = false, selected, onSelect, controls }: {
    name: string; logo?: string | null; cartKey?: string; storePath?: string; productKey?: string; cartPage?: boolean; blocks: Block[]; products: Product[]; preview?: boolean
    checkout?: CheckoutStore; refresh?: () => Promise<void>
    selected?: string; onSelect?: (id: string) => void; controls?: (block: Block) => ReactNode
}) {
    const [expanded, setExpanded] = useState<{ photo: string; title: string }>()
    const dialog = useRef<HTMLDialogElement>(null)
    const cart = useStorefrontCart(products, cartKey)
    const [previewCart, setPreviewCart] = useState(false)
    const [previewProductKey, setPreviewProductKey] = useState<string>()
    const productsByKey = new Map(products.map(product => [product.key, product]))

    const openedKey = preview ? previewProductKey : productKey
    const openedProduct = openedKey ? productsByKey.get(openedKey) : undefined

    function resetPreview() {
        setPreviewCart(false)
        setPreviewProductKey(undefined)
    }

    return <div className={styles.frame}>
        <StorefrontHeader name={name} logo={logo} count={cart.count} storePath={storePath}
            onOpenCart={() => setPreviewCart(true)} onHome={resetPreview} />
        {checkout && storePath && refresh ? <Checkout store={checkout} cart={cart} path={storePath} refresh={refresh} />
            : cartPage || previewCart ? <StorefrontCart cart={cart} storePath={storePath} /> : openedKey ? <div className={styles.productPage}>
            {openedProduct ? <StorefrontProduct key={openedProduct.key} product={openedProduct} cart={cart} />
                : <p role="alert">Товар не найден.</p>}
        </div> : <div className={styles.layout}>
            {blocks.map(block => {
                const title = block.title || blockNames[block.kind]
                const mode = imageMode(block)
                const cover = (block.kind === "hero" || block.kind === "image") && mode === "cover" && block.photo
                const shade = `rgb(0 0 0 / ${block.shade ?? 35}%)`
                let backgroundImage: string | undefined
                if (cover) backgroundImage = `linear-gradient(${shade}, ${shade}), url("${block.photo}")`
                else if (block.bgMode === "gradient") {
                    backgroundImage = `linear-gradient(${block.bgAngle ?? 135}deg, ${block.color}, ${block.bgEnd ?? "#b8c9bb"})`
                } else if (block.bgMode === "photo" && block.bgPhoto) {
                    backgroundImage = `url("${block.bgPhoto}")`
                }

                const collection = block.categoryId != null
                    ? products.filter(product => product.categoryId === block.categoryId)
                    : block.productKeys.flatMap(key => productsByKey.get(key) ?? [])
                const photo = block.photo

                return <div className={styles.slot} key={block.id}
                    data-selected={selected === block.id}
                    onClick={onSelect ? () => onSelect(block.id) : undefined}
                    style={{ "--span": blockSpan(block) } as CSSProperties}>
                    <article className={styles.block} data-cover={!!cover} data-hero={block.kind === "hero"}
                        style={{ backgroundColor: block.color, backgroundImage, fontFamily: fonts[block.font ?? ""] }}>
                        {photo && !cover && <img className={mode === "wide" ? styles.widePhoto : styles.blockPhoto}
                            src={photo} alt={block.kind === "image" ? title : ""} />}
                        <h2>{title}</h2>
                        {block.text && <p>{block.text}</p>}
                        {photo && block.kind === "image" && <button type="button" className={styles.action} onClick={() => {
                            setExpanded({ photo, title })
                            dialog.current?.showModal()
                        }}>Развернуть фото</button>}
                        {block.kind === "contacts" && <div className={styles.contacts}>
                            {contactFields.map(field => {
                                const value = block[field.key]?.trim() ?? ""
                                const href = contactHref(field, value)
                                if (!href) return null
                                const label = <>
                                    <span className={styles.badge} aria-hidden="true" data-network={field.key}>
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                                            <path fillRule="evenodd" d={contactIcons[field.key]} />
                                        </svg>
                                    </span>
                                    {field.key === "phone" ? value : field.label}
                                </>
                                return preview ? <span className={styles.contact} key={field.key}>{label}</span>
                                    : <a className={styles.contact} key={field.key} href={href}
                                        target={field.key === "phone" ? undefined : "_blank"}
                                        rel="noopener noreferrer">{label}</a>
                            })}
                        </div>}
                        {block.kind === "catalog" && collection.length > 0 &&
                            <div className={styles.catalog}>
                                {collection.map(product => {
                                    const path = `${storePath}/products/${encodeURIComponent(product.key)}`
                                    const name = product.name || "Товар без названия"
                                    const card = <>
                                        {product.photo && <img src={product.photo} alt="" />}
                                        <span className={styles.productName}>{name}</span>
                                    </>
                                    const openPreview = (event: MouseEvent) => {
                                        event.stopPropagation()
                                        setPreviewProductKey(product.key)
                                    }
                                    return <div className={styles.product} key={product.key}>
                                        {storePath ? <Link className={styles.productLink} to={path}>{card}</Link>
                                            : <button type="button" className={styles.productLink} onClick={openPreview}>{card}</button>}
                                        {product.price !== null && <span>{(product.price / 100).toLocaleString("ru-RU")} ₽</span>}
                                        {product.sizes.length > 0 ? (storePath
                                            ? <Link className={styles.action} to={path}>Выбрать размер</Link>
                                            : <button type="button" className={styles.action} onClick={openPreview}>Выбрать размер</button>)
                                            : <button type="button" className={styles.action} disabled={!cart.canAdd(product)}
                                                onClick={event => {
                                                    event.stopPropagation()
                                                    cart.change(product, 1)
                                                }}>{product.price === null ? "Цена не указана" : product.stock <= 0 ? "Нет в наличии" : "В корзину"}</button>}
                                    </div>
                                })}
                            </div>}
                    </article>
                    {controls?.(block)}
                </div>
            })}
        </div>}
        <dialog ref={dialog} className={styles.photoDialog} aria-label="Просмотр фото" onClose={() => setExpanded(undefined)}>
            <button type="button" className={styles.action} onClick={() => dialog.current?.close()}>Закрыть фото</button>
            {expanded && <img src={expanded.photo} alt={expanded.title} />}
        </dialog>
    </div>
}
