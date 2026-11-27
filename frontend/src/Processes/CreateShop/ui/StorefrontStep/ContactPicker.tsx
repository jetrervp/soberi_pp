import { useState } from "react"
import { Input } from "../../../../widgets/UI"
import type { Block } from "../../model/CreateShopTypes"
import { contactFields, contactHref } from "../../model/contacts"
import { contactIcons } from "./contactIcons"
import styles from "./StorefrontStep.module.scss"

export default function ContactPicker({ block, onChange }: { block: Block; onChange: (value: Partial<Block>) => void }) {
    const [visible, setVisible] = useState(() => contactFields.filter(field => block[field.key]).map(field => field.key))
    const available = contactFields.filter(field => !visible.includes(field.key))
    return <fieldset className={styles.productList}>
        <legend>Способы связи</legend>
        {contactFields.filter(field => visible.includes(field.key)).map(field => <div className={styles.contactField} key={field.key}>
            <div className={styles.contactHead}>
                <label htmlFor={`contact-${field.key}`}>
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d={contactIcons[field.key]} />
                    </svg>
                    {field.label}
                </label>
                <button type="button" aria-label={`Удалить контакт ${field.label}`} onClick={() => {
                    onChange({ [field.key]: "" })
                    setVisible(visible.filter(key => key !== field.key))
                }}>×</button>
            </div>
            <Input id={`contact-${field.key}`} value={block[field.key] ?? ""} placeholder={field.hint}
                type={field.key === "phone" ? "tel" : "text"} maxLength={field.key === "phone" ? 40 : 300}
                onChange={value => onChange({ [field.key]: value })} />
            {block[field.key]?.trim() && !contactHref(field, block[field.key] ?? "") &&
                <small>Проверьте номер, имя пользователя или ссылку.</small>}
        </div>)}
        {available.length > 0 && <label className={styles.addContact}>Добавить контакт
            <select value="" onChange={event => {
                const field = available.find(field => field.key === event.currentTarget.value)
                if (field) setVisible([...visible, field.key])
            }}>
                <option value="">Выберите способ связи</option>
                {available.map(field => <option key={field.key} value={field.key}>{field.label}</option>)}
            </select>
        </label>}
    </fieldset>
}
