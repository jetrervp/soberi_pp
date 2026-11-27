import styles from "./MyShop.module.scss"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAppSelector } from "../App/AppStore"
import { errorMessage, shopApi, type ShopSummary } from "../Processes/CreateShop"

export default function MyShop() {
    const token = useAppSelector(state => state.AuthStore.accessToken)
    const [shops, setShops] = useState<ShopSummary[]>()
    const [error, setError] = useState("")
    useEffect(() => {
        let canceled = false
        shopApi(token).list().then(({ data }) => {
            if (!canceled) setShops(data)
        }).catch(error => {
            if (!canceled) setError(errorMessage(error))
        })
        return () => { canceled = true }
    }, [token])

    return <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <h1>Мои магазины</h1>
            <Link to="/createShop" style={{
                padding: "10px 16px", borderRadius: 10, background: "#32614f", color: "#fff",
                fontWeight: 600, textDecoration: "none",
            }}>Создать магазин</Link>
        </div>
        {error && <p role="alert">{error}</p>}
        {!shops && !error && <p role="status">Загружаем магазины…</p>}
        {shops && (shops.length ? <ul className={styles.shops}>{shops.map(shop => <li key={shop.id} className={styles.card}>
            <Link className={styles.cardLink} to={`/Dashboard/myshops/${shop.id}`}>
                <h2>{shop.name}</h2>
                <p>{shop.description}</p>
                {shop.status === "ACTIVE" && <p className={styles.status}>Опубликован</p>}
                {shop.status === "DRAFT" && <p>Черновик</p>}
            </Link>
        </li>)}</ul> : <p>Здесь появятся созданные магазины.</p>)}
    </section>
}
