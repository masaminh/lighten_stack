import {Command} from 'commander';
import {createLightenStackImage} from './create_lighten_stack_image.js';

interface Options {
  output?: string;
  debug?: boolean;
}

export async function main(args: string[]): Promise<void> {
  const program = new Command();

  program
    .name('lighten_stack')
    .description('get lighten image')
    .option('-o, --output <output>', 'output file')
    .option('-d, --debug')
    .argument('<input...>', 'input files');

  program.parse(args);

  const options = program.opts<Options>();
  await createLightenStackImage(
    options.output ?? 'out.tiff',
    program.args,
    options.debug,
  );
}
