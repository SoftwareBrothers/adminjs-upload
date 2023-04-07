import { FormGroup, Label } from '@adminjs/design-system'
import { ShowPropertyProps } from 'adminjs'
import React, { FC } from 'react'

import File from './file.js'

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
