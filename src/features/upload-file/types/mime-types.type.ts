export const AudioMimeTypes = [
  'audio/aac',
  'audio/midi',
  'audio/x-midi',
  'audio/mpeg',
  'audio/ogg',
  'application/ogg',
  'audio/opus',
  'audio/wav',
  'audio/webm',
  'audio/3gpp2',
] as const

export const VideoMimeTypes = [
  'video/x-msvideo',
  'video/mpeg',
  'video/ogg',
  'video/mp2t',
  'video/webm',
  'video/3gpp',
  'video/3gpp2',
] as const

export const ImageMimeTypes = [
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/vnd.microsoft.icon',
  'image/tiff',
  'image/webp',
] as const

export const CompressedMimeTypes = [
  'application/x-bzip',
  'application/x-bzip2',
  'application/gzip',
  'application/java-archive',
  'application/x-tar',
  'application/zip',
  'application/x-7z-compressed',
] as const

export const DocumentMimeTypes = [
  'application/x-abiword',
  'application/x-freearc',
  'application/vnd.amazon.ebook',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-fontobject',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.rar',
  'application/rtf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const

export const TextMimeTypes = [
  'text/css',
  'text/csv',
  'text/html',
  'text/calendar',
  'text/javascript',
  'application/json',
  'application/ld+json',
  'text/javascript',
  'text/plain',
  'application/xhtml+xml',
  'application/xml',
  'text/xml',
] as const

export const BinaryDocsMimeTypes = [
  'application/epub+zip',
  'application/pdf',
] as const

export const FontMimeTypes = [
  'font/otf',
  'font/ttf',
  'font/woff',
  'font/woff2',
] as const

export const OtherMimeTypes = [
  'application/octet-stream',
  'application/x-csh',
  'application/vnd.apple.installer+xml',
  'application/x-httpd-php',
  'application/x-sh',
  'application/x-shockwave-flash',
  'vnd.visio',
  'application/vnd.mozilla.xul+xml',
] as const

export const MimeTypes = [
  ...AudioMimeTypes,
  ...VideoMimeTypes,
  ...ImageMimeTypes,
  ...CompressedMimeTypes,
  ...DocumentMimeTypes,
  ...TextMimeTypes,
  ...BinaryDocsMimeTypes,
  ...OtherMimeTypes,
  ...FontMimeTypes,
  ...OtherMimeTypes,
]

type PopularMimeTypes = typeof MimeTypes[number]

export type MimeType = PopularMimeTypes | {
  [key: string]: string
}
