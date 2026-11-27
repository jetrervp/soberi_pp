import styles from "./ProductsStep.module.scss"

const groups = {
    none: [],
    clothes: ["XS", "S", "M", "L", "XL", "XXL"],
    shoes: Array.from({ length: 14 }, (_, i) => String(i + 34)),
}
const labels = { none: "Без размеров", clothes: "Одежда", shoes: "Обувь" }
export type SizeMode = keyof typeof groups

export default function SizePicker({ mode, sizes, onChange }: {
    mode: SizeMode; sizes: string[]; onChange: (mode: SizeMode, sizes: string[]) => void
}) {
    return <fieldset className={styles.picker}>
        <legend>Размеры</legend>
        <div className={styles.chips} role="group" aria-label="Тип размеров">
            {(Object.keys(groups) as SizeMode[]).map(type =>
                <button key={type} type="button" aria-pressed={type === mode}
                    onClick={() => onChange(type, type === mode ? sizes : [])}>{labels[type]}</button>)}
        </div>
        {mode !== "none" && <div className={styles.chips} role="group" aria-label="Доступные размеры">
            {groups[mode].map(size => <button key={size} type="button" aria-pressed={sizes.includes(size)}
                onClick={() => onChange(mode, sizes.includes(size) ? sizes.filter(item => item !== size) : [...sizes, size])}>
                {size}
            </button>)}
        </div>}
    </fieldset>
}
