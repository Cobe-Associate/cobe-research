const extension2MimeType = (extension: string) => {
  const map: any = {
    'gif': 'image/gif',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'mp4': 'video/mp4',
  }
  return map[extension] || null
}

export const getFileMeta = (filename: string) => {
  const extension = (filename.match(/[^.]+$/) || [])[0]
  if (!extension) {
    return null
  }
  const mimeType: string = extension2MimeType(extension)
  if (!mimeType) {
    return null
  }
  if (/^image\/[-\w.]+$/.test(mimeType)) {
    return {
      type: 'image',
      mimeType: mimeType
    }
  }
  if (/^video\/[-\w.]+$/.test(mimeType)) {
    return {
      type: 'video',
      mimeType: mimeType
    }
  }
}