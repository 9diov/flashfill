import { Example } from './types.js';
import { ProgramSynthesizer } from './synthesizer.js';

export class FlashFill {
  private examples: Example[] = [];

  constructor(examples: Example[] = []) {
    this.examples = examples;
  }

  addExample(input: Array<string>, output: string): void {
    this.examples.push({ input, output });
  }

  predict(input: Array<string>): string {
    if (this.examples.length === 0) {
      return input[0];  // Return first column if no examples available
    }

    // Validate input length matches examples
    if (input.length !== this.examples[0].input.length) {
      throw new Error(`Input must have ${this.examples[0].input.length} columns`);
    }

    const synthesizer = new ProgramSynthesizer(this.examples);
    const program = synthesizer.synthesize();
    return program.apply(input);
  }

  clear(): void {
    this.examples = [];
  }
}