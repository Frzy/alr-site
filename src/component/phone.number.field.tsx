import * as React from 'react'
import { TextField, type TextFieldProps } from '@mui/material'
import { IMaskInput } from 'react-imask'

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
}

interface TextDisplayProps extends Omit<TextFieldProps, 'variant'> {
  editing?: boolean
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

export default function PhoneField({
  editing,
  autoComplete,
  ...textFieldProps
}: TextDisplayProps): React.ReactNode {
  return (
    <TextField
      {...textFieldProps}
      autoComplete={editing ? autoComplete : 'off'}
      variant={editing ? 'outlined' : 'standard'}
      inputProps={{
        ...textFieldProps.inputProps,
        readOnly: !editing,
        disabled: !editing,
      }}
      InputProps={
        !editing
          ? {
              ...textFieldProps.InputProps,
              inputComponent: PhoneNumberMask as any,
              disableUnderline: true,
            }
          : { ...textFieldProps.InputProps, inputComponent: PhoneNumberMask as any }
      }
    />
  )
}
