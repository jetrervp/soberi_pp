export const contactFields = [
    { key: "phone", label: "Телефон", hint: "+7 999 123-45-67" },
    { key: "telegram", label: "Telegram", hint: "@username или ссылка t.me" },
    { key: "vk", label: "ВКонтакте", hint: "https://vk.com/ваша_страница" },
    { key: "whatsapp", label: "WhatsApp", hint: "Номер телефона или ссылка wa.me" },
    { key: "max", label: "MAX", hint: "Ссылка из профиля MAX" },
] as const

const hosts: Partial<Record<typeof contactFields[number]["key"], string[]>> = {
    telegram: ["t.me"], vk: ["vk.com", "vk.ru"], whatsapp: ["wa.me", "api.whatsapp.com"],
    max: ["max.ru", "max.me"],
}

export function contactHref({ key }: typeof contactFields[number], value: string) {
    value = value.trim()
    if (!value) return undefined
    if (key === "phone" || key === "whatsapp") {
        const phone = value.replace(/[\s()-]/g, "")
        if (/^\+?\d{7,15}$/.test(phone)) {
            return key === "phone" ? `tel:${phone}` : `https://wa.me/${phone.replace(/^\+/, "")}`
        }
        if (key === "phone") return undefined
    }
    if (key === "telegram" && /^@?[a-zA-Z0-9_]+$/.test(value)) {
        return `https://t.me/${value.replace(/^@/, "")}`
    }
    try {
        const url = new URL(value.includes("://") ? value : `https://${value}`)
        if (url.protocol === "https:" && !url.port && !url.username && !url.password &&
            url.pathname !== "/" && hosts[key]?.includes(url.hostname.replace(/^www\./, ""))) return url.href
    } catch {
        return undefined
    }
}
