import { type ComponentPropsWithoutRef, type FC } from 'react'
import s from './input.module.scss'

interface IProps extends Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange'> {
    value: string
    onChange: (value: string) => void
}

const Input: FC<IProps> = ({ value, onChange, type = 'text', className, ...props }) => {
    return <input
        {...props}
        className={className ? `${s.Input} ${className}` : s.Input}
        type={type}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
    />
}

export default Input
