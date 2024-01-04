import { FormGroup, Label } from '@adminjs/design-system'
import { ShowPropertyProps, useTranslation } from 'adminjs'
import React, { FC } from 'react'

import File from './file.js'

const Show: FC<ShowPropertyProps> = (props) => {
  const { property } = props
  const { translateProperty } = useTranslation()

  return (
    <FormGroup>
      <Label>{translateProperty(property.label, property.resourceId)}</Label>
      <File width="100%" {...props} />
    </FormGroup>
  )
}

export default Show
