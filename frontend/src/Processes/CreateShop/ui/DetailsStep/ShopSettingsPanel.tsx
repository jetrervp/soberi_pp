import { useState } from "react"
import { Input } from "../../../../widgets/UI"
import type { ShopSettings } from "../../model/CreateShopTypes"
import styles from "../CreateShop/CreateShop.module.scss"

export default function ShopSettingsPanel({ shop, save }: {
    shop: ShopSettings
    save: (settings: ShopSettings) => Promise<boolean>
}) {
    const [value, setValue] = useState(() => ({
        name: shop.name, description: shop.description,
    }))
    const changed = value.name !== shop.name || value.description !== shop.description

    return <form onSubmit={async event => {
        event.preventDefault()
        if (changed && await save({ ...shop, ...value })) {
            setValue(current => ({ ...current, name: current.name.trim(), description: current.description.trim() }))
        }
    }}>
        <h2>Настройки магазина</h2>
        <label>Название магазина
            <Input required maxLength={100} value={value.name}
                onChange={name => setValue(current => ({ ...current, name }))} />
        </label>
        <label>Описание магазина
            <textarea required maxLength={2000} value={value.description}
                onChange={event => {
                    const description = event.currentTarget.value
                    setValue(current => ({ ...current, description }))
                }} />
        </label>
        <button type="submit" className={styles.saveSettings} disabled={!changed}>Сохранить настройки</button>
    </form>
}
