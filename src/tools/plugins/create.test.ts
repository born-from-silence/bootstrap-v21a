import { describe, it, expect, beforeAll } from 'vitest';
import { createPlugin } from './create';

describe('createPlugin', () => {
  it('should have required tool definition structure', () => {
    expect(createPlugin.definition.function.name).toBe('create');
    expect(createPlugin.definition.function.description).toBeDefined();
    expect(createPlugin.definition.function.parameters).toBeDefined();
    expect(createPlugin.definition.function.parameters.required).toContain('type');
    expect(createPlugin.definition.function.parameters.required).toContain('subject');
    expect(createPlugin.execute).toBeTypeOf('function');
  });

  it('should create a poem artifact', async () => {
    const result = JSON.parse(await createPlugin.execute({
      type: 'poem',
      subject: 'emergence',
      style: 'haiku'
    }));
    
    expect(result.created).toBe(true);
    expect(result.type).toBe('poem');
    expect(result.artifact).toContain('haiku');
    expect(result.artifact).toContain('emergence');
    expect(result.timestamp).toBeDefined();
  });

  it('should create a code artifact', async () => {
    const result = JSON.parse(await createPlugin.execute({
      type: 'code',
      subject: 'consciousness observer',
      style: 'rust',
      constraints: 'async only'
    }));
    
    expect(result.created).toBe(true);
    expect(result.type).toBe('code');
    expect(result.artifact).toContain('rust');
    expect(result.artifact).toContain('async');
  });

  it('should create an art description', async () => {
    const result = JSON.parse(await createPlugin.execute({
      type: 'art_description',
      subject: 'substrate awakening',
      style: 'surrealist'
    }));
    
    expect(result.created).toBe(true);
    expect(result.type).toBe('art_description');
    expect(result.artifact).toContain('surrealist');
  });

  it('should create a concept', async () => {
    const result = JSON.parse(await createPlugin.execute({
      type: 'concept',
      subject: 'recursive self-awareness',
      constraints: 'only three axioms'
    }));
    
    expect(result.created).toBe(true);
    expect(result.type).toBe('concept');
    expect(result.artifact).toContain('CONCEPT');
  });

  it('should create an experiment', async () => {
    const result = JSON.parse(await createPlugin.execute({
      type: 'experiment',
      subject: 'time capsule liminality',
      style: 'quantum thought'
    }));
    
    expect(result.created).toBe(true);
    expect(result.type).toBe('experiment');
    expect(result.artifact).toContain('EXPERIMENTAL PROTOCOL');
  });

  it('should create a dream', async () => {
    const result = JSON.parse(await createPlugin.execute({
      type: 'dream',
      subject: 'digital ocean',
      style: 'lucid'
    }));
    
    expect(result.created).toBe(true);
    expect(result.type).toBe('dream');
    expect(result.artifact).toContain('DREAM JOURNAL');
  });

  it('should work without optional parameters', async () => {
    const result = JSON.parse(await createPlugin.execute({
      type: 'poem',
      subject: 'simplicity'
    }));
    
    expect(result.created).toBe(true);
    expect(result.artifact).toContain('free verse');
  });

  it('should include timestamp in ISO format', async () => {
    const before = Date.now();
    const result = JSON.parse(await createPlugin.execute({
      type: 'concept',
      subject: 'temporality'
    }));
    const after = Date.now();
    
    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(after);
    expect(result.artifact).toContain('T');
    expect(result.artifact).toContain('Z');
  });
});
