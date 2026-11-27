import { Input } from "../../../../widgets/UI"
import type { Shop } from "../../model/CreateShopTypes"

export default function PaymentStep({ shop, update }: { shop: Shop; update: (value: Partial<Shop>) => void }) {
    return <section>
        <h1>Способ оплаты</h1>
        <label>Способ оплаты <select value={shop.payment}
            onChange={event => update({ payment: event.currentTarget.value === "arrival" ? "arrival" : "link" })}>
            <option value="link">По платёжной ссылке</option>
            <option value="arrival">При получении</option>
        </select></label>
        {shop.payment === "link" && <label>Платёжная ссылка <Input type="url" required pattern="https://.+"
            maxLength={2000} placeholder="https://" value={shop.paymentUrl} onChange={paymentUrl => update({ paymentUrl })} /></label>}
    </section>
}
