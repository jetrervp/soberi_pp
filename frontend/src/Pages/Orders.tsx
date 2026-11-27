import { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { errorMessage } from "../Processes/CreateShop/actions/CreateShopActions"
import { ordersApi, statusLabels, orderStages, formatDate, formatTotal, type OrderDetails, type OrderSummary, type Status } from "../Processes/Orders/OrdersApi"
import ConfirmDialog from "../widgets/UI/ConfirmDialog"
import styles from "../Processes/Orders/Orders.module.scss"

const path = "/Dashboard/orders"

export default function Orders() {
    const { orderId } = useParams()
    const [params, setParams] = useSearchParams()
    const completed = params.get("mode") === "completed"
    if (orderId) return <Detail key={orderId} id={orderId} />
    return <section className={styles.page}>
        <h1>Заказы</h1>
        <div className={styles.tabs} role="group" aria-label="Режим просмотра заказов">
            <button type="button" className={styles.secondary} aria-pressed={!completed} onClick={() => setParams({})}>Актуальные</button>
            <button type="button" className={styles.secondary} aria-pressed={completed}
                onClick={() => setParams({ mode: "completed" })}>Завершённые</button>
        </div>
        <OrderList key={String(completed)} completed={completed} />
    </section>
}

function OrderList({ completed }: { completed: boolean }) {
    const [orders, setOrders] = useState<OrderSummary[]>()
    const [next, setNext] = useState<number>()
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)
    const [cursor, setCursor] = useState<number>()
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        void ordersApi.list(completed, cursor, controller.signal).then(({ data }) => {
            if (controller.signal.aborted) return
            setOrders(current => cursor ? [...(current ?? []), ...data.orders] : data.orders)
            setNext(data.next)
            setError("")
        }).catch(failure => {
            if (!controller.signal.aborted) setError(errorMessage(failure))
        }).finally(() => { if (!controller.signal.aborted) setBusy(false) })
        return () => controller.abort()
    }, [completed, cursor, attempt])

    useEffect(() => {
        if (cursor !== undefined) return
        const timer = window.setInterval(() => {
            if (!document.hidden) setAttempt(value => value + 1)
        }, 12000)
        return () => window.clearInterval(timer)
    }, [cursor])

    return <>
        {error && <div className={styles.actions}>
            <p role="alert">{error}</p>
            <button type="button" className={styles.secondary} disabled={busy} onClick={() => {
                setBusy(true)
                setError("")
                setAttempt(value => value + 1)
            }}>Повторить</button>
        </div>}
        {!orders && !error && <p role="status">Загружаем заказы…</p>}
        {orders?.length === 0 && <p>{completed ? "Завершённых заказов пока нет." : "Актуальных заказов пока нет."}</p>}
        {orders && orders.length > 0 && <ul className={styles.orderList}>
            {orders.map(order => <li key={order.id}>
                <Link to={`${path}/${order.id}`}>
                    <strong>Заказ №{order.id}</strong>
                    <span>{order.storeName} · {order.firstName} {order.lastName}</span>
                    <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
                    <span className={styles.badge}>{statusLabels[order.status]}</span>
                    <strong>{formatTotal(order.total)}</strong>
                </Link>
            </li>)}
        </ul>}
        {next && <button type="button" className={styles.secondary} disabled={busy} onClick={() => {
            setBusy(true)
            setError("")
            setCursor(next)
            setAttempt(value => value + 1)
        }}>{busy ? "Загружаем…" : "Показать ещё"}</button>}
    </>
}

function Detail({ id }: { id: string }) {
    const [order, setOrder] = useState<OrderDetails>()
    const [choice, setChoice] = useState<Status>()
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [notice, setNotice] = useState("")
    const [error, setError] = useState("")
    useEffect(() => {
        const controller = new AbortController()
        void ordersApi.get(id, controller.signal).then(({ data }) => {
            if (!controller.signal.aborted) setOrder(data)
        }).catch(failure => {
            if (!controller.signal.aborted) setError(errorMessage(failure))
        })
        return () => controller.abort()
    }, [id])

    async function save() {
        if (!order || !choice || saving) return
        setConfirmOpen(false)
        setSaving(true)
        setNotice("")
        setError("")
        try {
            const { data } = await ordersApi.update(order.id, choice)
            setOrder(data)
            setChoice(undefined)
            setNotice(data.status === "DELIVERED" ? "Заказ перемещён в завершённые." : "Статус обновлён.")
        } catch (failure) { setError(errorMessage(failure)) }
        finally { setSaving(false) }
    }

    const next = order ? orderStages[orderStages.indexOf(order.status) + 1] : undefined
    return <section className={styles.page}>
        <Link to={order?.status === "DELIVERED" ? `${path}?mode=completed` : path}>К списку заказов</Link>
        {!order ? error ? <p role="alert">{error}</p> : <p role="status">Загружаем заказ…</p> : <>
            <header className={styles.orderHeading}>
                <h1>Заказ №{order.id}</h1>
                <p>{order.storeName} · {formatDate(order.createdAt)}</p>
            </header>
            <div className={styles.detailGrid}>
                <div>
                    <section className={styles.panel}>
                        <h2>Состав заказа</h2>
                        <ul className={styles.orderItems}>{order.items.map(item => <li key={item.id}>
                            <span>{item.name}{item.size ? ` · размер ${item.size}` : ""}</span>
                            <span>{item.quantity} шт.</span>
                            <strong>{formatTotal(item.unitPrice * item.quantity)}</strong>
                        </li>)}</ul>
                        <strong>Итого: {formatTotal(order.total)}</strong>
                        <p>{order.payment === "arrival" ? "Оплата при получении" : "Оплата по ссылке магазина"}</p>
                    </section>
                    <section className={styles.buyer}>
                        <h2>Покупатель</h2>
                        <p>{order.firstName} {order.lastName}</p>
                        <p>{order.email} · {order.phone}</p>
                        <h2>Адрес доставки</h2>
                        <p>{order.city}, {order.street}, {order.house}</p>
                    </section>
                </div>
                <section className={styles.panel}>
                    <h2>Статус заказа</h2>
                    <label>
                        <span className={styles.visuallyHidden}>Текущий статус заказа</span>
                        <select value={choice ?? order.status} disabled={!next || saving}
                            onChange={event => setChoice(event.currentTarget.value as Status)}>
                            <option value={order.status}>{statusLabels[order.status]}</option>
                            {next && <option value={next}>{statusLabels[next]}</option>}
                        </select>
                    </label>
                    {next && <button type="button" className={styles.primary} disabled={!choice || choice === order.status || saving}
                        onClick={() => setConfirmOpen(true)}>{saving ? "Сохраняем…" : "Изменить статус"}</button>}
                    {notice && <p className={styles.successNotice} role="status">{notice}</p>}
                    {error && <p role="alert">{error}</p>}
                    <ol className={styles.history}>{order.history.map(event => <li key={event.status}>
                        <span>{statusLabels[event.status]}</span>
                        <time dateTime={event.createdAt}>{formatDate(event.createdAt)}</time>
                    </li>)}</ol>
                </section>
            </div>
            {confirmOpen && choice && <ConfirmDialog title="Изменить статус заказа"
                message={`Заказ №${order.id}: «${statusLabels[order.status]}» → «${statusLabels[choice]}».`}
                confirmLabel="Сохранить статус" onCancel={() => setConfirmOpen(false)} onConfirm={() => void save()} />}
        </>}
    </section>
}
