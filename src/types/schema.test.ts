import { describe, it, expect } from 'vitest';
import {
  isSetAction,
  isCallAction,
  isEmitAction,
  isFetchAction,
  isIfAction,
  type SetAction,
  type CallAction,
  type EmitAction,
  type FetchAction,
  type IfAction,
} from './schema';

describe('Action Type Guards', () => {
  it('should identify SetAction', () => {
    const action: SetAction = { set: 'count', value: 1 };
    expect(isSetAction(action)).toBe(true);
    expect(isCallAction(action)).toBe(false);
  });

  it('should identify CallAction', () => {
    const action: CallAction = { call: 'increment', args: [1] };
    expect(isCallAction(action)).toBe(true);
    expect(isSetAction(action)).toBe(false);
  });

  it('should identify EmitAction', () => {
    const action: EmitAction = { emit: 'change', payload: { value: 1 } };
    expect(isEmitAction(action)).toBe(true);
    expect(isSetAction(action)).toBe(false);
  });

  it('should identify FetchAction', () => {
    const action: FetchAction = { fetch: '/api/data', method: 'GET' };
    expect(isFetchAction(action)).toBe(true);
    expect(isSetAction(action)).toBe(false);
  });

  it('should identify IfAction', () => {
    const action: IfAction = {
      if: 'count > 0',
      then: { set: 'positive', value: true },
    };
    expect(isIfAction(action)).toBe(true);
    expect(isSetAction(action)).toBe(false);
  });
});
