import { beforeEach, describe, expect, it } from 'vitest';
import { addSubmittedId, getSubmittedIds } from './submissionStatus';

describe('submissionStatus', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty set when userId is missing', () => {
    const set = getSubmittedIds();
    expect(set).toBeInstanceOf(Set);
    expect([...set]).toEqual([]);
  });

  it('reads submitted ids for a specific user only', () => {
    localStorage.setItem('submittedAssignmentIds_101', JSON.stringify([1, 2]));
    localStorage.setItem('submittedAssignmentIds_202', JSON.stringify([3]));

    expect([...getSubmittedIds(101)]).toEqual([1, 2]);
    expect([...getSubmittedIds(202)]).toEqual([3]);
  });

  it('returns empty set for invalid JSON', () => {
    localStorage.setItem('submittedAssignmentIds_1', '{bad-json}');
    expect([...getSubmittedIds(1)]).toEqual([]);
  });

  it('adds numeric id and deduplicates values', () => {
    addSubmittedId('5', 10);
    addSubmittedId(5, 10);
    addSubmittedId(6, 10);

    const values = [...getSubmittedIds(10)].sort((a, b) => a - b);
    expect(values).toEqual([5, 6]);
  });

  it('does not write when userId is missing', () => {
    addSubmittedId(7);
    expect(localStorage.length).toBe(0);
  });
});
