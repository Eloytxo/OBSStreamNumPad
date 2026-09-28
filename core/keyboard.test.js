import { describe, test, expect } from 'vitest';
import { normalizeAccelerator } from './keyboard.js';

describe('normalizeAccelerator', () => {

    test.each([
        ['num0', 'Numpad0'],
        ['num1', 'Numpad1'],
        ['num2', 'Numpad2'],
        ['num3', 'Numpad3'],
        ['num4', 'Numpad4'],
        ['num5', 'Numpad5'],
        ['num6', 'Numpad6'],
        ['num7', 'Numpad7'],
        ['num8', 'Numpad8'],
        ['num9', 'Numpad9'],
    ])('maps "%s" to "%s"', (input, expected) => {
        expect(normalizeAccelerator(input)).toBe(expected);
    });

    test('normalizes mixed-case Electron accelerators', () => {
        expect(normalizeAccelerator('Num5')).toBe('Numpad5');
    });

    test('returns already normalized values unchanged', () => {
        expect(normalizeAccelerator('Numpad3')).toBe('Numpad3');
    });

    test.each([
        ['numpad3', null],
        [null, null],
        [undefined, null],
        ['', null],
        ['foo', null],
        ['num10', null],
        ['Numpad10', null],
    ])('returns null for invalid accelerator "%s"', (input, expected) => {
        expect(normalizeAccelerator(input)).toBe(expected);
    });

});
