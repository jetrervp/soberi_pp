import { useCallback, useEffect, useState } from "react"
import type { Product } from "../../model/CreateShopTypes"

export const cartLimit = (product: Product) => product.price === null ? 0 : Math.max(0, Math.min(product.stock ?? 0, 20))

function cartLineKey(product: Product, size?: string) {
    return size ? `${product.key}:${size}` : product.key
}

function productLines(product: Product, quantities: Record<string, number>) {
    let remaining = cartLimit(product)
    const sizes = product.sizes.length ? product.sizes : [undefined]
    return sizes.flatMap(size => {
        const key = cartLineKey(product, size)
        const quantity = Math.min(remaining, quantities[key] ?? 0)
        remaining -= quantity
        return quantity > 0 ? [{ key, product, size, quantity }] : []
    })
}

export function useStorefrontCart(products: Product[], storeKey?: string) {
    const storageKey = storeKey ? `storefront-cart:${storeKey}` : undefined
    const [quantities, setQuantities] = useState<Record<string, number>>(() => {
        if (!storageKey) return {}
        try {
            const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "{}")
            if (saved && typeof saved === "object" && !Array.isArray(saved)) {
                return Object.fromEntries(Object.entries(saved).filter(([, quantity]) => Number.isInteger(quantity) && quantity > 0))
            }
        } catch {
            // Keep the cart usable when storage is unavailable.
        }
        return {}
    })

    const lines = products.flatMap(product => productLines(product, quantities))
    const saved = JSON.stringify(Object.fromEntries(lines.map(({ key, quantity }) => [key, quantity])))

    useEffect(() => {
        if (!storageKey) return
        try {
            if (saved === "{}") localStorage.removeItem(storageKey)
            else localStorage.setItem(storageKey, saved)
        } catch {
            // The current visit still has an in-memory cart.
        }
    }, [storageKey, saved])

    function canAdd(product: Product) {
        return lines.filter(line => line.product.key === product.key)
            .reduce((total, line) => total + line.quantity, 0) < cartLimit(product)
    }

    function change(product: Product, delta: number, size?: string) {
        if (product.sizes.length ? !size || !product.sizes.includes(size) : size !== undefined) return
        setQuantities(current => {
            const key = cartLineKey(product, size)
            const normalized = productLines(product, current)
            const total = normalized.reduce((sum, line) => sum + line.quantity, 0)
            const previous = normalized.find(line => line.key === key)?.quantity ?? 0
            const quantity = Math.max(0, Math.min(previous + delta, previous + cartLimit(product) - total))
            const next = { ...current, [product.key]: 0 }
            for (const option of product.sizes) next[cartLineKey(product, option)] = 0
            for (const line of normalized) next[line.key] = line.quantity
            next[key] = quantity
            return next
        })
    }

    function remove(product: Product, size?: string) {
        change(product, -cartLimit(product), size)
    }

    const clear = useCallback(() => {
        setQuantities({})
    }, [])

    return {
        lines, change, remove, canAdd, clear,
        count: lines.reduce((total, line) => total + line.quantity, 0),
        subtotal: lines.reduce((total, { product, quantity }) => total + (product.price ?? 0) * quantity, 0),
    }
}
