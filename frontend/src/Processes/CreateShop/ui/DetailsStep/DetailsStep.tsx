import { Input } from "../../../../widgets/UI"
import type { Shop } from "../../model/CreateShopTypes"

export default function DetailsStep({ shop, update }: { shop: Shop; update: (value: Partial<Shop>) => void }) {
    return <section>
        <h1>Расскажите о магазине</h1>
        <label>Название магазина <Input required maxLength={100} value={shop.name} onChange={name => update({ name })} /></label>
        <label>Описание магазина <textarea required maxLength={2000} value={shop.description}
            onChange={event => update({ description: event.currentTarget.value })} /></label>
    </section>
}
