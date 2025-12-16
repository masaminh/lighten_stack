import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import ora from 'ora'

function chunk<T> (array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, (i + 1) * size)
  )
}

async function createLightenStackImageInternal (
  outFile: string,
  inFiles: string[]
): Promise<void> {
  const compositeImages = inFiles
    .slice(1)
    .map<sharp.OverlayOptions>(file => ({ input: file, blend: 'lighten' }))
  await sharp(inFiles[0])
    .pipelineColorspace('rgb16')
    .composite(compositeImages)
    .tiff({ compression: 'deflate' })
    .toColorspace('rgb16')
    .toFile(outFile)
}

export async function createLightenStackImage (
  outFile: string,
  inFiles: string[],
  debug?: boolean
): Promise<void> {
  const workDirectory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'lighten-stack')
  )

  try {
    if (debug) {
      console.debug(`work directory: ${workDirectory}`)
    }

    let fileNum = 0
    const workFilePaths = [] as string[]

    for (const files of chunk(inFiles, 10)) {
      fileNum = fileNum + files.length
      const message = `stacking: ${fileNum} / ${inFiles.length}...`
      const spinner = ora(message).start()
      const workFilePath = path.join(workDirectory, `${fileNum}.tiff`)

      await createLightenStackImageInternal(workFilePath, files)

      workFilePaths.push(workFilePath)
      spinner.succeed(message + 'done')
    }

    const message = 'integrating...'
    const spinner = ora(message).start()
    await createLightenStackImageInternal(outFile, workFilePaths)
    spinner.succeed(message + 'done')
  } finally {
    if (!debug) {
      await fs.promises.rm(workDirectory, { recursive: true })
    }
  }
}
