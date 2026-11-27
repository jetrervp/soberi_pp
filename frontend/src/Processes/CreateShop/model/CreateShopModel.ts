import type { Block, Shop } from "./CreateShopTypes"

export const blockNames = { hero: "Обложка", text: "Текст", catalog: "Каталог", image: "Изображение", contacts: "Контакты" }

export function imageMode(block: Block) {
    return block.imageMode ?? (block.photoCover ? block.kind === "image" ? "wide" : "cover" : "inline")
}

export function blockSpan(block: Block) {
    return block.kind === "image" && block.photo && imageMode(block) === "wide" ? 12 : block.span ?? 12
}

export function formatPrice(raw: string) {
    const [integer, ...fraction] = raw.replace(/\./g, ",").replace(/[^\d,]/g, "").split(",")
    const whole = integer.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    return fraction.length ? `${whole || "0"},${fraction.join("").slice(0, 2)}` : whole
}

export function initialBlocks(shop: Pick<Shop, "name" | "description" | "products">): Block[] {
    return [
        { id: crypto.randomUUID(), kind: "hero", title: shop.name, text: shop.description.slice(0, 1000), color: "#deebe2", productKeys: [] },
        { id: crypto.randomUUID(), kind: "catalog", title: "Каталог", text: "", color: "#ffffff",
            productKeys: shop.products.map(product => product.key) },
    ]
}

export const blankShop: Shop = {
    id: 0, slug: "", logoPhotoId: null, logo: null, status: "DRAFT", revision: 0, setupStep: 0, name: "", description: "",
    products: [], categories: [], blocks: null, origin: "", destinationCities: [], payment: "link", paymentUrl: "",
}