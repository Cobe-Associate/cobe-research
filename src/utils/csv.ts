export const downloadCsv = (arr: any, name: string) => {
  const data: any = arr
  .map((row: any) => row.map((str: string) => '"' + (str ? str.replace(/"/g, '""') : '') + '"'))
  .map((row: any) => row.join(','))
  .join('\n')

	const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
	const blob = new Blob([bom, data], { type: 'text/csv' })
	if (window.navigator.msSaveBlob) {
		window.navigator.msSaveBlob(blob, name)
    window.navigator.msSaveOrOpenBlob(blob, name)
  } else {
    const anchor: any = document.createElement('a')
    anchor.download = name
    anchor.href = window.URL.createObjectURL(blob)
    document.body.appendChild(anchor)
    anchor.click()
    anchor.parentNode.removeChild(anchor)
  }
}