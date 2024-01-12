import * as React from 'react'
import { TextField, type TextFieldProps } from '@mui/material'
import { IMaskInput } from 'react-imask'

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
}

const PhoneNumberMask = React.forwardRef<HTMLInputElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props
    return (
      <IMaskInput
        {...other}
        mask='#00-000-0000'
        definitions={{
          '#': /[1-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) => {
          onChange({ target: { name: props.name, value } })
        }}
        overwrite
      />
    )
  },
)

export default function PhoneField(props: TextFieldProps): React.ReactNode {
  return (
    <TextField
      {...props}
      InputProps={{ ...props.InputProps, inputComponent: PhoneNumberMask as any }}
    />
  )
}
