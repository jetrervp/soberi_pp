export interface Category { id: number; name: string }

export interface Product {
    categoryId?: number | null
    key: string
    name: string
    description: string
    price: number | null
    stock: number
    sizes: string[]
    photoId?: string | null
    photo?: string | null
}

export interface Block {
    id: string
    kind: "hero" | "text" | "catalog" | "image" | "contacts"
    title: string
    text: string
    color: string
    productKeys: string[]
    span?: number
    font?: "" | "sans" | "serif" | "mono" | "trebuchet" | "times"
    photoCover?: boolean
    imageMode?: "inline" | "cover" | "wide"
    shade?: number
    bgMode?: "color" | "gradient" | "photo"
    bgEnd?: string
    bgAngle?: number
    bgPhotoId?: string | null
    bgPhoto?: string | null
    categoryId?: number | null
    phone?: string
    telegram?: string
    vk?: string
    whatsapp?: string
    max?: string
    photoId?: string | null
    photo?: string | null
}

export interface Shop {
    id: number
    slug: string
    logoPhotoId: string | null
    logo: string | null
    status: "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "BLOCKED"
    revision: number
    setupStep: number
    name: string
    description: string
    products: Product[]
    categories: Category[]
    blocks: Block[] | null
    origin: string
    destinationCities: string[]
    payment: "link" | "arrival"
    paymentUrl: string
}

export type StorefrontTemplate = { id: number; name: string }

export type ShopSettings = Pick<Shop, "name" | "description" | "logoPhotoId" | "logo">

export type ShopSummary = Pick<Shop, "id" | "name" | "description" | "status">
