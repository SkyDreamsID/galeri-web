self.onmessage = async (e: MessageEvent) => {
  const { file, MAX_WIDTH, MAX_HEIGHT } = e.data
  try {
    let bitmap = await createImageBitmap(file)
    let width = bitmap.width
    let height = bitmap.height

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      if (width > height) {
        height = Math.round(height * (MAX_WIDTH / width))
        width = MAX_WIDTH
      } else {
        width = Math.round(width * (MAX_HEIGHT / height))
        height = MAX_HEIGHT
      }
      bitmap.close()
      // Use native fast resizing
      bitmap = await createImageBitmap(file, { resizeWidth: width, resizeHeight: height, resizeQuality: 'medium' })
    }

    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      self.postMessage({ success: false, error: 'Cannot get canvas context' })
      return
    }

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close() // Free memory instantly

    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })
    
    self.postMessage({ success: true, blob: blob })
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message || 'Compression failed' })
  }
}
