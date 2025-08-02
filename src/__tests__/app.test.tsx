/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

function Sample() {
  return <h1>Hello, Vitest</h1>;
}

describe('Sample component', () => {
  it('renders greeting', () => {
    render(<Sample />);
    expect(screen.getByText('Hello, Vitest')).toBeInTheDocument();
  });
});
