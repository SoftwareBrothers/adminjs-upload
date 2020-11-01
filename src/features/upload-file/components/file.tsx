import React, { FC } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Icon, Button, Box } from '@admin-bro/design-system'

import { ShowPropertyProps, flat } from 'admin-bro'
import { ImageMimeTypes, AudioMimeTypes } from '../types/mime-types.type'
import PropertyCustom from '../types/property-custom.type'

type Props = ShowPropertyProps & {
  width?: number | string;
};

type SingleFileProps = {
  name: string,
  path?: string,
  mimeType?: string,
  width?: number | string;
}

const SingleFile: FC<SingleFileProps> = (props) => {
  const { name, path, mimeType, width } = props
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

const File: FC<Props> = ({ width, record, property }) => {
  const { custom } = property as unknown as { custom: PropertyCustom }

  const path = flat.get(record?.params, custom.filePathProperty)

  if (!path) {
    return null
  }

  const name = flat.get(
    record?.params,
    custom.fileNameProperty ? custom.fileNameProperty : custom.keyProperty,
  )
  const mimeType = custom.mimeTypeProperty && flat.get(record?.params, custom.mimeTypeProperty)

  if (!property.custom.multiple) {
    return <SingleFile path={path} name={name} width={width} mimeType={mimeType} />
  }

  return (
    <>
      {path.map((singlePath, index) => (
        <SingleFile
          key={singlePath}
          path={singlePath}
          name={name[index]}
          width={width}
          mimeType={mimeType[index]}
        />
      ))}
    </>
  )
}

export default File
