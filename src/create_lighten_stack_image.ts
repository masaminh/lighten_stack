import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp, { type OverlayOptions } from 'sharp'
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
    .map<OverlayOptions>(file => ({ input: file, blend: 'lighten' }))
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

    const chunkPath = path.join(workDirectory, 'chunk.tiff')
    const accumulatorPaths = [
      path.join(workDirectory, 'accumulator-0.tiff'),
      path.join(workDirectory, 'accumulator-1.tiff')
    ]

    const chunks = chunk(inFiles, 10)
    let fileNum = 0
    let accumulatorIndex: number | undefined

    for (const [index, files] of chunks.entries()) {
      fileNum = fileNum + files.length
      const message = `stacking: ${fileNum} / ${inFiles.length}...`
      const spinner = ora(message).start()
      const isLast = index === chunks.length - 1

      if (accumulatorIndex === undefined) {
        await createLightenStackImageInternal(
          isLast ? outFile : accumulatorPaths[0],
          files
        )
        accumulatorIndex = isLast ? undefined : 0
      } else {
        await createLightenStackImageInternal(chunkPath, files)

        const nextAccumulatorIndex = 1 - accumulatorIndex
        await createLightenStackImageInternal(
          isLast ? outFile : accumulatorPaths[nextAccumulatorIndex],
          [accumulatorPaths[accumulatorIndex], chunkPath]
        )
        accumulatorIndex = isLast ? undefined : nextAccumulatorIndex
      }

      spinner.succeed(message + 'done')
    }
  } finally {
    if (!debug) {
      await fs.promises.rm(workDirectory, { recursive: true })
    }
  }
}
