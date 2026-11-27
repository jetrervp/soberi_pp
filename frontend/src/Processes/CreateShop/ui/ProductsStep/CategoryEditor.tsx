import { useState } from "react"
import type { Category } from "../../model/CreateShopTypes"
import styles from "./ProductsStep.module.scss"

export default function CategoryEditor({ categories, onCreate, onSelect, onError }: {
    categories: Category[]
    onCreate: (name: string) => Promise<Category>
    onSelect: (id: number) => void
    onError: (error: unknown) => void
}) {
    const [name, setName] = useState("")
    const [busy, setBusy] = useState(false)
    const [notice, setNotice] = useState("")

    async function add() {
        if (busy || !name.trim()) return
        setBusy(true)
        setNotice("")
        try {
            const category = await onCreate(name.trim())
            onSelect(category.id)
            setName("")
            setNotice(`Категория «${category.name}» создана.`)
        } catch (error) {
            onError(error)
        } finally {
            setBusy(false)
        }
    }

    return <fieldset className={styles.product} disabled={busy}>
        <legend>Категории товаров</legend>
        <label>Название новой категории
            <input value={name} maxLength={80} onChange={event => setName(event.currentTarget.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        event.preventDefault()
                        void add()
                    }
                }} />
        </label>
        <button type="button" onClick={() => void add()} disabled={!name.trim()}>Добавить категорию</button>
        {categories.length > 0 && <p>{categories.map(category => category.name).join(", ")}</p>}
        <p role="status">{notice}</p>
    </fieldset>
}
