import type { CheckoutStore } from "../../Orders/OrdersApi"
import { instance } from "../../../App/AppApi"
import type { Block, Category, Product, Shop, ShopSettings, ShopSummary, StorefrontTemplate } from "../model/CreateShopTypes"

function serializeBlocks(blocks: Block[] | null) {
    return blocks?.map(({ id, kind, title, text, color, productKeys, span, font, photoId, photoCover, phone, telegram, vk, whatsapp, max,
        imageMode, shade, bgMode, bgEnd, bgAngle, bgPhotoId, categoryId }) =>
        ({ id, kind, title, text, color, productKeys, span, font, photoId, photoCover, phone, telegram, vk, whatsapp, max,
        imageMode, shade, bgMode, bgEnd, bgAngle, bgPhotoId, categoryId })) ?? null
}

function serializeProducts(products: Product[]) {
    return products.map(({ key, name, description, price, stock, sizes, photoId, categoryId }) =>
        ({ key, name, description, price, stock, sizes, photoId, categoryId }))
}

export function getPublicStore(id: string) {
    return instance.get<Pick<Shop, "name" | "description" | "logo" | "blocks" | "products"> & CheckoutStore>(`/stores/public/${encodeURIComponent(id)}`)
}

export function shopApi(token: string | null) {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    return {
        list: () => instance.get<ShopSummary[]>("/stores", config),
        get: (id: string, signal?: AbortSignal) => instance.get<Shop>(`/stores/${encodeURIComponent(id)}`, { ...config, signal }),
        revision: (id: string, signal: AbortSignal) =>
            instance.get<{ revision: number }>(`/stores/${encodeURIComponent(id)}/revision`, { ...config, signal }),
        remove: (id: number) => instance.delete(`/stores/${id}`, config),
        create: (key: string, { name, description }: Shop) =>
            instance.post<Shop>("/stores/draft", { key, name, description }, config),
        save: (shop: Shop, step: number) => instance.put<{ revision: number }>(`/stores/${shop.id}`, {
            revision: shop.revision, step, name: shop.name, description: shop.description,
            products: serializeProducts(shop.products),
            blocks: serializeBlocks(shop.blocks), origin: shop.origin, destinationCities: shop.destinationCities,
            payment: shop.payment, paymentUrl: shop.paymentUrl,
        }, config),
        templates: (signal: AbortSignal) => instance.get<StorefrontTemplate[]>("/stores/storefront/templates", { ...config, signal }),
        applyTemplate: ({ id, revision }: Shop, sourceId: number) =>
            instance.post<Pick<Shop, "blocks" | "revision">>(`/stores/${id}/storefront/template`, { revision, sourceId }, config),
        saveSettings: (id: number, revision: number, { name, description, logoPhotoId }: ShopSettings) =>
            instance.put<Pick<Shop, "revision" | "name" | "description">>(`/stores/${id}/settings`, {
                revision, name, description, logoPhotoId,
            }, config),
        saveProducts: (shop: Shop) => instance.put<{ revision: number }>(`/stores/${shop.id}/products`, {
            revision: shop.revision, products: serializeProducts(shop.products),
        }, config),
        saveEditor: (shop: Shop) => instance.put<{ revision: number }>(`/stores/${shop.id}/storefront`, {
            revision: shop.revision, blocks: serializeBlocks(shop.blocks),
        }, config),
        publish: ({ id, revision }: Shop) =>
            instance.post<{ revision: number }>(`/stores/${id}/storefront/publish`, { revision }, config),
        createCategory: (id: number, name: string) =>
            instance.post<Category>(`/stores/${id}/categories`, { name }, config),
        upload: (id: number, file: File) => {
            const body = new FormData()
            body.append("photo", file)
            return instance.post<Pick<Product, "photoId" | "photo">>(`/stores/${id}/photo`, body, config)
        },
        complete: (shop: Shop) => instance.post(`/stores/${shop.id}/complete`, { revision: shop.revision }, config),
    }
}
