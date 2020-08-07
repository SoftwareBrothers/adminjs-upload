import React, { FC } from 'react'
import { BasePropertyProps } from 'admin-bro'

import File from './file'

const List: FC<BasePropertyProps> = ({ record }) => {
  const { path, filename } = record?.params || {}
  console.log('path', path, filename)

  return (<File width={100} path={path} alt={filename} />)
}

export default List
