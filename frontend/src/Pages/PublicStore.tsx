import { useEffect, useState } from "react"
import { Navigate, useMatch, useParams } from "react-router-dom"
import { getPublicStore } from "../Processes/CreateShop/api/CreateShopApi"
import { initialBlocks } from "../Processes/CreateShop/model/CreateShopModel"
import Storefront from "../Processes/CreateShop/ui/StorefrontStep/Storefront"
import type { CheckoutStore } from "../Processes/Orders/OrdersApi"
import type { Block, Product } from "../Processes/CreateShop/model/CreateShopTypes"

export default function PublicStore() {
    const { id, productKey } = useParams()
    const cartPage = Boolean(useMatch("/store/:id/cart"))
    const checkoutPage = Boolean(useMatch("/store/:id/checkout"))
    return id ? <Store key={id} id={id} productKey={productKey} cartPage={cartPage} checkoutPage={checkoutPage} /> : null
}

function Store({ id, productKey, cartPage, checkoutPage }: { id: string; productKey?: string; cartPage: boolean; checkoutPage: boolean }) {
    const [store, setStore] = useState<CheckoutStore & { name: string; logo: string | null; blocks: Block[]; products: Product[] }>()
    const [error, setError] = useState("")

    useEffect(() => {
        if (!/^[a-z0-9][a-z0-9_-]{0,127}$/i.test(id)) return
        let canceled = false
        void getPublicStore(id).then(({ data }) => {
            if (!canceled) setStore({ ...data, blocks: data.blocks ?? initialBlocks(data) })
        }).catch(error => {
            if (!canceled) setError(error?.response?.status === 404
                ? "Магазин не найден." : "Не удалось загрузить витрину. Обновите страницу.")
        })
        return () => { canceled = true }
    }, [id])

    if (!/^[a-z0-9][a-z0-9_-]{0,127}$/i.test(id)) return <p role="alert">Магазин не найден.</p>
    if (error) return <p role="alert">{error}</p>
    if (!store) return <p role="status">Загружаем витрину…</p>

    const path = `/store/${encodeURIComponent(store.slug)}`
    const destination = checkoutPage ? `${path}/checkout` : cartPage ? `${path}/cart` : productKey ? `${path}/products/${encodeURIComponent(productKey)}` : path
    if (id !== store.slug) return <Navigate replace to={destination} />

    async function refresh() {
        try {
            const { data } = await getPublicStore(id)
            setStore({ ...data, blocks: data.blocks ?? initialBlocks(data) })
        } catch {
            // Keep the current view and original checkout error if refreshing fails.
        }
    }

    return <main aria-label={store.name}>
        <Storefront name={store.name} logo={store.logo} cartKey={store.slug} storePath={path} productKey={productKey} cartPage={cartPage}
            checkout={checkoutPage ? store : undefined} refresh={refresh} blocks={store.blocks} products={store.products} />
    </main>
}
