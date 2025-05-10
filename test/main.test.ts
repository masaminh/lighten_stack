import {main} from '@/main.js';
import {createLightenStackImage} from '@/create_lighten_stack_image.js';

vitest.mock('@/create_lighten_stack_image');

const createLightenStackImageMock = vitest.mocked(createLightenStackImage);

describe('main', () => {
  afterEach(() => {
    vitest.resetAllMocks();
  });

  it('main', async () => {
    createLightenStackImageMock.mockResolvedValue();
    const args = ['node', 'main.js', 'input'];
    await main(args);
    expect(createLightenStackImageMock).toHaveBeenCalledTimes(1);
    expect(createLightenStackImageMock).toHaveBeenCalledWith(
      'out.tiff',
      ['input'],
      undefined,
    );
  });

  it('main: output option', async () => {
    createLightenStackImageMock.mockResolvedValue();
    const args = ['node', 'main.js', '-o', 'output', 'input'];
    await main(args);
    expect(createLightenStackImageMock).toHaveBeenCalledTimes(1);
    expect(createLightenStackImageMock).toHaveBeenCalledWith(
      'output',
      ['input'],
      undefined,
    );
  });
});
