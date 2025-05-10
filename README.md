# lighten_stack

`lighten_stack` is a CLI tool for creating a single image by performing lighten blend compositing on multiple input images.

## Features

- Compare multiple input images and generate a single output image using lighten blend compositing.
- Supports TIFF format for both input and output.

## Installation

Install via npm:

```bash
npm install -g lighten_stack
```

## Usage

```bash
lighten_stack [options] <input...>
```

### Arguments

- `input`: Input files (must be in TIFF format).

### Options

- `-o, --output <output>`: Specify the output file (must be in TIFF format).
- `-d, --debug`: Enable debug mode.
- `-h, --help`: Display help for the command.

### Example

```bash
lighten_stack -o output.tiff input1.tiff input2.tiff input3.tiff
```

This command will take `input1.tiff`, `input2.tiff`, and `input3.tiff` as input, perform lighten blend compositing, and save the result to `output.tiff`.

## License

MIT  
