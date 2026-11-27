import { useParams } from "react-router-dom"
import CreateShop from "../Processes/CreateShop"

export const Storefront = () => <CreateShop editorOnly />

export function ManageShop() {
    const { id } = useParams()
    return <CreateShop key={id} manageId={id} />
}

export default CreateShop