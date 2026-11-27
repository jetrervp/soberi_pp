import { instance } from "../../App/AppApi"

export const statusLabels = {
    PROCESSING: "В обработке",
    PACKED: "Собран",
    SHIPPED: "Отправлен",
    DELIVERED: "Доставлен",
}
export type Status = keyof typeof statusLabels
export const orderStages = Object.keys(statusLabels) as Status[]

export type CheckoutStore = {
    slug: string
    payment: "arrival" | "link"
    paymentAvailable: boolean
    destinationCities: string[]
}

export interface OrderReceipt {
    id: number
    total: number
    payment: CheckoutStore["payment"]
    paymentUrl: string | null
}

export interface Progress {
    status: Status
    createdAt: string
}

export interface Tracking {
    id: number
    storeName: string
    storeSlug: string
    status: Status
    history: Progress[]
}

export interface OrderSummary {
    id: number
    storeName: string
    firstName: string
    lastName: string
    total: number
    status: Status
    createdAt: string
}

export interface OrderDetails extends OrderSummary {
    email: string
    phone: string
    city: string
    street: string
    house: string
    payment: CheckoutStore["payment"]
    items: { id: number; name: string; size: string | null; unitPrice: number; quantity: number }[]
    history: Progress[]
}

export type Buyer = Pick<OrderDetails, "firstName" | "lastName" | "email" | "phone" | "city" | "street" | "house">
type CreateOrder = Buyer & {
    requestKey: string
    expectedTotal: number
    items: { productKey: string; size?: string; quantity: number }[]
}

const money = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 0 })
export const formatTotal = (value: number) => money.format(value / 100)
export const formatDate = (value: string) => new Date(value).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })

export const ordersApi = {
    create: (slug: string, order: CreateOrder) =>
        instance.post<OrderReceipt>(`/stores/public/${encodeURIComponent(slug)}/orders`, order),
    receipt: (slug: string, requestKey: string, signal: AbortSignal) =>
        instance.get<OrderReceipt>(`/stores/public/${encodeURIComponent(slug)}/orders/receipt/${encodeURIComponent(requestKey)}`, { signal }),
    track: (token: string, signal: AbortSignal) =>
        instance.get<Tracking>(`/orders/track/${encodeURIComponent(token)}`, { signal }),
    list: (completed: boolean, before: number | undefined, signal: AbortSignal) =>
        instance.get<{ orders: OrderSummary[]; next?: number }>("/orders", { params: { completed, before }, signal }),
    get: (id: string, signal: AbortSignal) =>
        instance.get<OrderDetails>(`/orders/${encodeURIComponent(id)}`, { signal }),
    update: (id: number, status: Status) =>
        instance.patch<OrderDetails>(`/orders/${id}/status`, { status }),
}
