/// <reference types="vitest" />

describe('App', () => {
  it('should keep the project identity explicit', () => {
    expect('Radici San Giovanni Lipioni').toContain('San Giovanni Lipioni');
  });
});
