import React, { FC, useState, useEffect } from 'react'
import {
  EditPropertyProps, DropZone, FormGroup, Label, DropZoneItem,
} from 'admin-bro'
import PropertyCustom from '../property-custom.type'

const Edit: FC<EditPropertyProps> = ({ property, record, onChange }) => {
  const { params } = record
  const { custom } = property as unknown as { custom: PropertyCustom }

  const path = params[custom.filePathProperty]
  const key = params[custom.keyProperty]
  const file = params[custom.fileProperty]

  const [originalKey, setOriginalKey] = useState(key)
  const [filesToUpload, setFilesToUpload] = useState<Array<File>>([])

  useEffect(() => {
    // it means means that someone hit save and new file has been uploaded
    // in this case fliesToUpload should be cleared.
    // This happens when user turns off redirect after new/edit
    if (key !== originalKey) {
      setOriginalKey(key)
      setFilesToUpload([])
    }
  }, [key, originalKey])

  const onUpload = (files: Array<File>): void => {
    setFilesToUpload(files)
    const [fileToUpload] = files

    onChange({
      ...record,
      params: {
        ...params,
        ...(fileToUpload && { [custom.fileProperty]: fileToUpload }),
      },
    })
  }

  const handleRemove = () => {
    onChange(custom.fileProperty, null)
  }

  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <DropZone
        onChange={onUpload}
        validate={{
          mimeTypes: custom.mimeTypes as Array<string>,
          maxSize: custom.maxSize,
        }}
      />
      {key && path && !filesToUpload.length && file !== null && (
        <DropZoneItem filename={key} src={path} onRemove={handleRemove} />
      )}
    </FormGroup>
  )
}

export default Edit
