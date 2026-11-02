import { describe, expect, test } from 'vitest';
import { FEEDBACK_FORM_URL, FEEDBACK_TEXT, isFeedbackFormReady } from './feedback';

describe('feedback form configuration', () => {
  test('the shipped link is a live forms.gle link', () => {
    expect(FEEDBACK_FORM_URL).toMatch(/^https:\/\/forms\.gle\/\S+$/);
    expect(isFeedbackFormReady(FEEDBACK_FORM_URL)).toBe(true);
  });

  test('a leftover placeholder is never treated as a live form', () => {
    expect(isFeedbackFormReady('https://forms.gle/GANTI-DENGAN-PAUTAN-ANDA')).toBe(false);
  });

  test('accepts a forms.gle short link', () => {
    expect(isFeedbackFormReady('https://forms.gle/abc123XYZ')).toBe(true);
  });

  test('accepts a docs.google.com/forms link', () => {
    expect(
      isFeedbackFormReady('https://docs.google.com/forms/d/e/1FAIpQLSf/viewform'),
    ).toBe(true);
  });

  test('rejects unrelated links and empty input', () => {
    expect(isFeedbackFormReady('http://forms.gle/abc')).toBe(false);
    expect(isFeedbackFormReady('https://example.com/form')).toBe(false);
    expect(isFeedbackFormReady('   ')).toBe(false);
  });

  test('tolerates stray whitespace around a real link', () => {
    expect(isFeedbackFormReady('  https://forms.gle/abc123XYZ  ')).toBe(true);
  });

  test('ships the three instruction steps and a privacy note', () => {
    expect(FEEDBACK_TEXT.steps).toHaveLength(3);
    expect(FEEDBACK_TEXT.note).toContain('Google Form');
  });
});
