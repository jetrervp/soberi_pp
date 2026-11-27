import { isAxiosError } from "axios"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { formatDate, ordersApi, orderStages, statusLabels, type Tracking } from "../Processes/Orders/OrdersApi"
import styles from "../Processes/Orders/Orders.module.scss"

export default function TrackOrder() {
    const { token } = useParams()
    return token ? <TrackingPage key={token} token={token} /> : null
}

function TrackingPage({ token }: { token: string }) {
    const [order, setOrder] = useState<Tracking>()
    const [failure, setFailure] = useState<{ message: string; permanent?: boolean }>()
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        let refreshing = false
        async function refresh() {
            if (refreshing) return
            refreshing = true
            try {
                const { data } = await ordersApi.track(token, controller.signal)
                if (controller.signal.aborted) return
                setOrder(data)
                setFailure(undefined)
                if (data.status === "DELIVERED") window.clearInterval(timer)
            } catch (error) {
                if (controller.signal.aborted) return
                const status = isAxiosError(error) ? error.response?.status : undefined
                if (status === 404 || status === 400) {
                    window.clearInterval(timer)
                    setOrder(undefined)
                    setFailure({
                        message: status === 404
                            ? "Заказ по этой ссылке не найден. Проверьте письмо о заказе: старая ссылка могла стать недоступна после удаления заказа."
                            : "Ссылка на отслеживание недействительна. Откройте ссылку из письма о заказе.",
                        permanent: true,
                    })
                } else {
                    setFailure({ message: "Не удалось обновить статус заказа. Попробуйте ещё раз." })
                }
            } finally { refreshing = false }
        }
        const timer = window.setInterval(() => void refresh(), 15000)
        void refresh()
        return () => { window.clearInterval(timer); controller.abort() }
    }, [token, attempt])

    return <main className={`${styles.page} ${styles.tracking}`}>
        <h1>Отслеживание заказа</h1>
        {order && <>
            <p className={styles.trackingStore}><Link to={`/store/${encodeURIComponent(order.storeSlug)}`}>{order.storeName}</Link></p>
            <div className={styles.panel}>
                <h2>Заказ №{order.id}</h2>
                <p className={styles.badge}>{statusLabels[order.status]}</p>
                <ol className={styles.timeline}>{orderStages.map(status => {
                    const event = order.history.find(item => item.status === status)
                    return <li key={status} data-done={Boolean(event)} aria-current={order.status === status ? "step" : undefined}>
                        <strong>{statusLabels[status]}</strong>
                        {event && <time dateTime={event.createdAt}>{formatDate(event.createdAt)}</time>}
                    </li>
                })}</ol>
            </div>
        </>}
        {failure && <div className={styles.actions}>
            <p role="alert">{failure.message}</p>
            {!failure.permanent && <button type="button" className={styles.secondary}
                onClick={() => setAttempt(value => value + 1)}>Повторить</button>}
        </div>}
        {!order && !failure && <p role="status">Загружаем заказ…</p>}
    </main>
}
