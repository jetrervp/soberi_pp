import { isAxiosError } from "axios"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { errorMessage } from "../CreateShop/actions/CreateShopActions"
import type { useStorefrontCart } from "../CreateShop/ui/StorefrontStep/useStorefrontCart"
import { formatTotal, ordersApi, type CheckoutStore, type OrderReceipt } from "./OrdersApi"
import styles from "./Orders.module.scss"

function readKey(key: string) {
    try { return sessionStorage.getItem(key) } catch { return null }
}

function storeKey(key: string, value?: string) {
    try {
        if (value) sessionStorage.setItem(key, value)
        else sessionStorage.removeItem(key)
    } catch { /* The mounted form still retains the key for retries. */ }
}

export default function Checkout({ store, cart, path, refresh }: {
    store: CheckoutStore; cart: ReturnType<typeof useStorefrontCart>; path: string; refresh: () => Promise<void>
}) {
    const key = `checkout-request:${store.slug}`
    const [previous] = useState(() => readKey(key))
    const request = useRef(previous)
    const [recovering, setRecovering] = useState(Boolean(previous))
    const [receipt, setReceipt] = useState<OrderReceipt>()
    const [busy, setBusy] = useState(false)
    const submitting = useRef(false)
    const [error, setError] = useState("")
    const { clear } = cart

    useEffect(() => {
        if (!previous) return
        const controller = new AbortController()
        void ordersApi.receipt(store.slug, previous, controller.signal).then(({ data }) => {
            if (controller.signal.aborted) return
            clear()
            setReceipt(data)
            storeKey(key)
        }).catch(() => undefined).finally(() => {
            if (!controller.signal.aborted) setRecovering(false)
        })
        return () => controller.abort()
    }, [store.slug, key, previous, clear])

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (submitting.current || !store.paymentAvailable || !cart.lines.length) return
        submitting.current = true
        setBusy(true)
        setError("")
        const fields = new FormData(event.currentTarget)
        const value = (name: string) => String(fields.get(name) ?? "").trim()
        const requestKey = request.current ?? crypto.randomUUID()
        request.current = requestKey
        storeKey(key, requestKey)
        try {
            const { data } = await ordersApi.create(store.slug, {
                requestKey, firstName: value("firstName"), lastName: value("lastName"), email: value("email"),
                phone: value("phone"), city: value("city"), street: value("street"), house: value("house"),
                expectedTotal: cart.subtotal,
                items: cart.lines.map(({ product, size, quantity }) => ({ productKey: product.key, size, quantity })),
            })
            clear()
            setReceipt(data)
            storeKey(key)
            void refresh()
        } catch (failure) {
            setError(errorMessage(failure))
            if (isAxiosError(failure) && failure.response?.status === 409) void refresh()
        } finally {
            submitting.current = false
            setBusy(false)
        }
    }

    if (recovering) return <p role="status">Проверяем оформление заказа…</p>
    if (receipt) return <section className={styles.page}>
        <h2>Заказ оформлен</h2>
        <div className={styles.success}>
            <h3>Спасибо за заказ №{receipt.id}</h3>
            <p>Сумма заказа — <strong>{formatTotal(receipt.total)}</strong>.</p>
            <p>Номер заказа и ссылка на отслеживание будут отправлены на вашу почту.</p>
            {receipt.payment === "arrival" && <p>Оплата при получении.</p>}
            <div className={styles.actions}>
                {receipt.paymentUrl && <a className={styles.primary} href={receipt.paymentUrl} target="_blank" rel="noopener noreferrer">Перейти к оплате</a>}
                <Link className={styles.secondary} to={path}>Вернуться в каталог</Link>
            </div>
        </div>
    </section>

    return <section className={styles.page}>
        <h2>Доставка и оплата</h2>
        {!cart.lines.length ? <div className={styles.panel}>
            {error && <p role="alert">{error}</p>}
            <p>Корзина пуста.</p>
            <Link to={path}>Вернуться в каталог</Link>
        </div> : <form className={styles.checkoutGrid} onSubmit={event => void submit(event)}>
            <div className={styles.recipientFields}>
                <fieldset disabled={busy}>
                    <legend>Получатель</legend>
                    <div className={styles.fieldRow}>
                        <label>Имя <input name="firstName" autoComplete="given-name" maxLength={80} required /></label>
                        <label>Фамилия <input name="lastName" autoComplete="family-name" maxLength={80} required /></label>
                    </div>
                    <label>Email <input name="email" type="email" autoComplete="email" maxLength={200} required /></label>
                    <label>Номер телефона <input name="phone" type="tel" autoComplete="tel" maxLength={32} required /></label>
                </fieldset>
                <fieldset disabled={busy}>
                    <legend>Адрес доставки</legend>
                    <label>Город
                        {store.destinationCities.length ? <select name="city" autoComplete="address-level2" defaultValue="" required>
                            <option value="" disabled>Выберите город</option>
                            {store.destinationCities.map(city => <option key={city}>{city}</option>)}
                        </select> : <input name="city" autoComplete="address-level2" maxLength={100} required />}
                    </label>
                    <div className={styles.fieldRow}>
                        <label>Улица <input name="street" autoComplete="address-line1" maxLength={150} required /></label>
                        <label>Дом <input name="house" autoComplete="address-line2" maxLength={35} required /></label>
                    </div>
                </fieldset>
            </div>
            <aside className={styles.summary}>
                <h3>К оплате за товары — {formatTotal(cart.subtotal)}</h3>
                <p>Стоимость доставки уточнит магазин.</p>
                <p>{store.payment === "link" ? "Оплата по ссылке магазина" : "Оплата при получении"}</p>
                {error && <p role="alert">{error}</p>}
                {!store.paymentAvailable && <p role="alert">Магазин ещё не настроил ссылку для оплаты.</p>}
                <button className={styles.primary} type="submit" disabled={busy || !store.paymentAvailable}>
                    {busy ? "Оформляем…" : "Оформить заказ"}
                </button>
            </aside>
        </form>}
    </section>
}
