import { ShowPropertyProps } from 'adminjs'
import React, { FC } from 'react'

import File from './file.js'

const List: FC<ShowPropertyProps> = (props) => (<File width={100} {...props} />)

export default List
