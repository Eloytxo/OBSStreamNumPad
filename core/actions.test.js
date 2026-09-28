import { describe, test, expect } from 'vitest';
import { ActionType } from './actions.js';

describe('ActionType', () => {

    test('has the expected constant values', () => {
        expect(ActionType.SCENE).toBe('scene');
        expect(ActionType.MEDIA).toBe('media');
        expect(ActionType.TOGGLE_VISIBILITY).toBe('toggle_visibility');
    });

    test('contains exactly the expected keys', () => {
        expect(Object.keys(ActionType).sort()).toEqual([
            'MEDIA',
            'SCENE',
            'TOGGLE_VISIBILITY',
        ]);
    });

});
