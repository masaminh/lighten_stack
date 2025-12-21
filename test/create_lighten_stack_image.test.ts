import sharp from 'sharp'
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
    } as unknown as sharp.Sharp
    const oraObject = {
      start: vitest.fn().mockReturnThis(),
      succeed: vitest.fn().mockReturnThis(),
    } as unknown as Ora

    sharpMock.mockReturnValue(sharpObject)
    oraMock.mockReturnValue(oraObject)

    const outfile = 'outfile.tiff'
    const infiles = ['infile1.tiff', 'infile2.tiff']

    await createLightenStackImage(outfile, infiles)

    expect(sharpMock).toHaveBeenCalledTimes(2)
    expect(sharpMock).toHaveBeenNthCalledWith(1, 'infile1.tiff')
    expect(debugMock).not.toHaveBeenCalled()
  })

  it('createLightenStackImage with debug', async () => {
    const sharpObject = {
      toColorspace: vitest.fn().mockReturnThis(),
      pipelineColorspace: vitest.fn().mockReturnThis(),
      composite: vitest.fn().mockReturnThis(),
      tiff: vitest.fn().mockReturnThis(),
      toFile: vitest.fn().mockReturnThis(),
    } as unknown as sharp.Sharp
    const oraObject = {
      start: vitest.fn().mockReturnThis(),
      succeed: vitest.fn().mockReturnThis(),
    } as unknown as Ora

    sharpMock.mockReturnValue(sharpObject)
    oraMock.mockReturnValue(oraObject)

    const outfile = 'outfile.tiff'
    const infiles = ['infile1.tiff', 'infile2.tiff']

    await createLightenStackImage(outfile, infiles, true)

    expect(sharpMock).toHaveBeenCalledTimes(2)
    expect(sharpMock).toHaveBeenNthCalledWith(1, 'infile1.tiff')
    expect(debugMock).toHaveBeenCalled()
  })
})
