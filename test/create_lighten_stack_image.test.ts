import sharp, { type Sharp } from 'sharp'
import ora, { Ora } from 'ora'
import { createLightenStackImage } from '@/create_lighten_stack_image.js'

vitest.mock('sharp')
const sharpMock = vitest.mocked(sharp)

vitest.mock('ora')
const oraMock = vitest.mocked(ora)

const debugMock = vitest.spyOn(console, 'debug')

describe('create_lighten_stack_image', () => {
  afterEach(() => {
    vitest.resetAllMocks()
  })

  it('createLightenStackImage', async () => {
    const sharpObject = {
      toColorspace: vitest.fn().mockReturnThis(),
      pipelineColorspace: vitest.fn().mockReturnThis(),
      composite: vitest.fn().mockReturnThis(),
      tiff: vitest.fn().mockReturnThis(),
      toFile: vitest.fn().mockReturnThis(),
    } as unknown as Sharp
    const oraObject = {
      start: vitest.fn().mockReturnThis(),
      succeed: vitest.fn().mockReturnThis(),
    } as unknown as Ora

    sharpMock.mockReturnValue(sharpObject)
    oraMock.mockReturnValue(oraObject)

    const outfile = 'outfile.tiff'
    const infiles = ['infile1.tiff', 'infile2.tiff']

    await createLightenStackImage(outfile, infiles)

    // single chunk (<=10 files): composited directly into outFile, no fold merge needed
    expect(sharpMock).toHaveBeenCalledTimes(1)
    expect(sharpMock).toHaveBeenNthCalledWith(1, 'infile1.tiff')
    expect(sharpObject.toFile).toHaveBeenNthCalledWith(1, outfile)
    expect(debugMock).not.toHaveBeenCalled()
  })

  it('createLightenStackImage with debug', async () => {
    const sharpObject = {
      toColorspace: vitest.fn().mockReturnThis(),
      pipelineColorspace: vitest.fn().mockReturnThis(),
      composite: vitest.fn().mockReturnThis(),
      tiff: vitest.fn().mockReturnThis(),
      toFile: vitest.fn().mockReturnThis(),
    } as unknown as Sharp
    const oraObject = {
      start: vitest.fn().mockReturnThis(),
      succeed: vitest.fn().mockReturnThis(),
    } as unknown as Ora

    sharpMock.mockReturnValue(sharpObject)
    oraMock.mockReturnValue(oraObject)

    const outfile = 'outfile.tiff'
    const infiles = ['infile1.tiff', 'infile2.tiff']

    await createLightenStackImage(outfile, infiles, true)

    expect(sharpMock).toHaveBeenCalledTimes(1)
    expect(sharpMock).toHaveBeenNthCalledWith(1, 'infile1.tiff')
    expect(debugMock).toHaveBeenCalled()
  })

  it('createLightenStackImage folds multiple chunks incrementally', async () => {
    const sharpObject = {
      toColorspace: vitest.fn().mockReturnThis(),
      pipelineColorspace: vitest.fn().mockReturnThis(),
      composite: vitest.fn().mockReturnThis(),
      tiff: vitest.fn().mockReturnThis(),
      toFile: vitest.fn().mockReturnThis(),
    } as unknown as Sharp
    const oraObject = {
      start: vitest.fn().mockReturnThis(),
      succeed: vitest.fn().mockReturnThis(),
    } as unknown as Ora

    sharpMock.mockReturnValue(sharpObject)
    oraMock.mockReturnValue(oraObject)

    const outfile = 'outfile.tiff'
    // 12 files -> 2 chunks of 10 and 2
    const infiles = Array.from({ length: 12 }, (_, i) => `infile${i + 1}.tiff`)

    await createLightenStackImage(outfile, infiles)

    // chunk 1 (10 files) -> accumulator-0.tiff
    // chunk 2 (2 files) -> chunk.tiff, then merged with accumulator-0.tiff -> outfile
    expect(sharpMock).toHaveBeenCalledTimes(3)
    expect(sharpMock).toHaveBeenNthCalledWith(1, 'infile1.tiff')
    expect(sharpObject.toFile).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('accumulator-0.tiff')
    )
    expect(sharpMock).toHaveBeenNthCalledWith(2, 'infile11.tiff')
    expect(sharpObject.toFile).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('chunk.tiff')
    )
    expect(sharpMock).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('accumulator-0.tiff')
    )
    expect(sharpObject.composite).toHaveBeenNthCalledWith(3, [
      { input: expect.stringContaining('chunk.tiff'), blend: 'lighten' }
    ])
    expect(sharpObject.toFile).toHaveBeenNthCalledWith(3, outfile)
  })

  it('createLightenStackImage ping-pongs the accumulator across 3+ chunks', async () => {
    const sharpObject = {
      toColorspace: vitest.fn().mockReturnThis(),
      pipelineColorspace: vitest.fn().mockReturnThis(),
      composite: vitest.fn().mockReturnThis(),
      tiff: vitest.fn().mockReturnThis(),
      toFile: vitest.fn().mockReturnThis(),
    } as unknown as Sharp
    const oraObject = {
      start: vitest.fn().mockReturnThis(),
      succeed: vitest.fn().mockReturnThis(),
    } as unknown as Ora

    sharpMock.mockReturnValue(sharpObject)
    oraMock.mockReturnValue(oraObject)

    const outfile = 'outfile.tiff'
    // 21 files -> 3 chunks of 10, 10 and 1
    const infiles = Array.from({ length: 21 }, (_, i) => `infile${i + 1}.tiff`)

    await createLightenStackImage(outfile, infiles)

    // chunk 1 (10 files)              -> accumulator-0.tiff
    // chunk 2 (10 files) -> chunk.tiff, merge with accumulator-0.tiff -> accumulator-1.tiff
    // chunk 3 (1 file)   -> chunk.tiff, merge with accumulator-1.tiff -> outfile
    expect(sharpMock).toHaveBeenCalledTimes(5)
    expect(sharpObject.toFile).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('accumulator-0.tiff')
    )
    expect(sharpObject.toFile).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('chunk.tiff')
    )
    expect(sharpMock).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('accumulator-0.tiff')
    )
    expect(sharpObject.toFile).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('accumulator-1.tiff')
    )
    expect(sharpObject.toFile).toHaveBeenNthCalledWith(
      4,
      expect.stringContaining('chunk.tiff')
    )
    expect(sharpMock).toHaveBeenNthCalledWith(
      5,
      expect.stringContaining('accumulator-1.tiff')
    )
    expect(sharpObject.toFile).toHaveBeenNthCalledWith(5, outfile)
  })
})
