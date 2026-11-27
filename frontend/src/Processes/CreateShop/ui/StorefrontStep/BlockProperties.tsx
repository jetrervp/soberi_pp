import { Input } from "../../../../widgets/UI"
import type { Block, Category, Product } from "../../model/CreateShopTypes"
import ContactPicker from "./ContactPicker"
import { blockSpan, imageMode } from "../../model/CreateShopModel"
import styles from "./StorefrontStep.module.scss"

const allowedImages = "image/png,image/jpeg,image/webp,image/gif"

export default function BlockProperties({ block, products, categories, onChange, onPhoto, onError }: {
    block?: Block; products: Product[]; categories: Category[]; onChange: (value: Partial<Block>) => void
    onPhoto: (id: string, file: File, background: boolean) => Promise<void>; onError: (error: unknown) => void
}) {
    if (!block) return <aside className={styles.tools}><h2>Свойства блока</h2><p>Выберите блок для редактирования.</p></aside>
    const mode = imageMode(block)
    const hasPhoto = block.kind === "hero" || block.kind === "image"

    function photoInput(label: string, background: boolean) {
        if (!block) return null
        return <label>{label} <input type="file" accept={allowedImages} onChange={event => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ""
            if (file) void onPhoto(block.id, file, background).catch(onError)
        }} /></label>
    }

    return <aside className={styles.tools}>
        <h2>Свойства блока</h2>
        <label>Заголовок <Input value={block.title} maxLength={100} onChange={title => onChange({ title })} /></label>
        {block.kind !== "catalog" && <label>Текст <textarea value={block.text} maxLength={1000}
            onChange={event => onChange({ text: event.currentTarget.value })} /></label>}
        <label>Ширина {blockSpan(block)} из 12 <Input type="range" min={1} max={12} value={String(blockSpan(block))}
            disabled={mode === "wide" && !!block.photo}
            onChange={value => onChange({ span: Number(value) })} /></label>
        <label>Шрифт <select value={block.font ?? ""} onChange={event =>
            onChange({ font: event.currentTarget.value as Block["font"] })}>
            <option value="">Системный</option>
            <option value="sans">Arial</option>
            <option value="serif">Georgia</option>
            <option value="trebuchet">Trebuchet MS</option>
            <option value="times">Times New Roman</option>
            <option value="mono">Consolas</option>
        </select></label>

        {hasPhoto && <>
            {photoInput("Изображение", false)}
            {block.photoId && <button type="button" onClick={() => onChange({ photoId: null, photo: null })}>Убрать изображение</button>}
            <label>Отображение фото <select value={mode} onChange={event =>
                onChange({ imageMode: event.currentTarget.value as Block["imageMode"] })}>
                <option value="inline">Над текстом</option>
                <option value="cover">На весь фон блока</option>
                {block.kind === "image" && <option value="wide">На всю ширину витрины</option>}
            </select></label>
            {mode === "cover" && <label>Затемнение {block.shade ?? 35}%
                <Input type="range" min={0} max={90} value={String(block.shade ?? 35)} onChange={value => onChange({ shade: Number(value) })} />
            </label>}
        </>}
        {!(hasPhoto && mode === "cover" && block.photo) && <>
            <label>Тип фона <select value={block.bgMode ?? "color"} onChange={event =>
                onChange({ bgMode: event.currentTarget.value as Block["bgMode"] })}>
                <option value="color">Сплошной цвет</option>
                <option value="gradient">Градиент</option>
                <option value="photo">Фоновое фото</option>
            </select></label>
            <label>Цвет фона <Input type="color" value={block.color} onChange={color => onChange({ color })} /></label>
            {block.bgMode === "gradient" && <>
                <label>Второй цвет <Input type="color" value={block.bgEnd ?? "#b8c9bb"} onChange={bgEnd => onChange({ bgEnd })} /></label>
                <label>Угол градиента {block.bgAngle ?? 135}°
                    <Input type="range" min={0} max={360} value={String(block.bgAngle ?? 135)} onChange={value => onChange({ bgAngle: Number(value) })} />
                </label>
            </>}
            {block.bgMode === "photo" && <>
                {photoInput("Фоновое фото", true)}
                {block.bgPhotoId && <button type="button" onClick={() => onChange({ bgPhotoId: null, bgPhoto: null })}>Убрать фон</button>}
            </>}
        </>}

        {block.kind === "contacts" && <ContactPicker block={block} onChange={onChange} />}
        {block.kind === "catalog" && <fieldset className={styles.productList}>
            <legend>Товары в каталоге</legend>
            <label className={styles.addContact}>Источник товаров
                <select value={block.categoryId ?? ""} onChange={event => onChange({ categoryId: Number(event.currentTarget.value) || null })}>
                    <option value="">Выбранные товары</option>
                    {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
            </label>
            {block.categoryId == null && <>
                {products.length === 0 && <p>В магазине пока нет товаров.</p>}
                {products.map(product => <label className={styles.check} key={product.key}>
                    <input type="checkbox" checked={block.productKeys.includes(product.key)} onChange={event =>
                        onChange({ productKeys: event.currentTarget.checked
                            ? [...block.productKeys, product.key]
                            : block.productKeys.filter(key => key !== product.key) })} />
                    {product.name || "Товар без названия"}
                </label>)}
            </>}
        </fieldset>}
    </aside>
}
