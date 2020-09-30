import React, { FC } from 'react'
import { ShowPropertyProps } from 'admin-bro'
import { FormGroup, Label } from '@admin-bro/design-system'

import File from './file'

const Show: FC<ShowPropertyProps> = (props) => {
  const { property } = props

  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <File width="100%" {...props} />
    </FormGroup>
  )
}

export default Show
