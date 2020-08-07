import React, { FC } from 'react'
import { ShowPropertyProps, FormGroup, Label } from 'admin-bro'

import File from './file'

const Show: FC<ShowPropertyProps> = ({ property, record }) => {
  const { path, filename } = record.params

  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <File path={path} alt={filename} width="100%" />
    </FormGroup>
  )
}

export default Show
