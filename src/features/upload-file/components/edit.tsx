import React, { FC, useState } from 'react'
import {
  EditPropertyProps, DropZone, FormGroup, Label, DropZoneItem,
} from 'admin-bro'

const Edit: FC<EditPropertyProps> = ({ property, record, onChange }) => {
  const { params } = record
  const fieldName = property.custom.file
  const { mimeTypes } = property.custom
  const { maxSize } = property.custom

  const [filesToUpload, setFilesToUpload] = useState<Array<File>>([])
  const [originalFilename] = useState(params.filename)

  const onUpload = (files: Array<File>): void => {
    setFilesToUpload(files)

    const newRecord = { ...record }
    const [file] = files
    const { file: oldFile, filename, ...other } = newRecord.params
    const newParams = file
      ? { ...other, filename: file.name, [fieldName]: file }
      : { ...other, ...(originalFilename ? { filename: originalFilename } : {}) }

    onChange({
      ...newRecord,
      params: newParams,
    })
  }

  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <DropZone
        onChange={onUpload}
        validate={{
          mimeTypes,
          maxSize,
        }}
      />
      {params.path && !filesToUpload.length && (
        <DropZoneItem filename={params.filename} src={params.path} />
      )}
    </FormGroup>
  )
}

export default Edit
