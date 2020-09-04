import React, { FC } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Icon, Button, Box } from '@admin-bro/design-system'

import { ShowPropertyProps } from 'admin-bro'
import { ImageMimeTypes, AudioMimeTypes } from '../mime-types.type'
import PropertyCustom from '../property-custom.type'

type Props = ShowPropertyProps & {
  width?: number | string;
};

const File: FC<Props> = ({ width, record, property }) => {
  const { custom } = property as unknown as { custom: PropertyCustom }
  const { provider } = custom

  let path = record?.params[custom.filePathProperty]
  if (!path) {
    return null
  }

  if (provider === 'local' && typeof path === 'string' && !path.startsWith('/')) {
    // append / to the path when bucket is defined as a relative path
    // which is in the case of Local adapter when bucket is 'public'
    path = `/${path}`
  }

  const name = custom.fileNameProperty
    ? record?.params[custom.fileNameProperty]
    : record?.params[custom.keyProperty]
  const mimeType = custom.mimeTypeProperty && record?.params[custom.mimeTypeProperty]

  if (path && path.length) {
    if (mimeType && ImageMimeTypes.includes(mimeType as any)) {
      return <img src={path} style={{ maxHeight: width, maxWidth: width }} alt={name} />
    }
    if (mimeType && AudioMimeTypes.includes(mimeType as any)) {
      return (
        <audio
          controls
          src={path}
        >
          Your browser does not support the
          <code>audio</code>
          <track kind="captions" />
        </audio>
      )
    }
  }
  return (
    <Box>
      <Button as="a" href={path} ml="default" size="sm" rounded target="_blank">
        <Icon icon="DocumentDownload" color="white" mr="default" />
        {name}
      </Button>
    </Box>
  )
}

export default File
