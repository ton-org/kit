/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it, vi } from 'vitest';

import { withTimeout } from './withTimeout';

describe('withTimeout', () => {
    it('should resolve if promise resolves before timeout', async () => {
        const promise = new Promise((resolve) => setTimeout(() => resolve('success'), 10));
        await expect(withTimeout(promise, 50)).resolves.toBe('success');
    });

    it('should reject if promise times out', async () => {
        const promise = new Promise((resolve) => setTimeout(() => resolve('success'), 50));
        await expect(withTimeout(promise, 10)).rejects.toThrow('Execution timed out - 10ms');
    });

    it('should propagate rejection from original promise', async () => {
        const promise = new Promise((_, reject) => setTimeout(() => reject(new Error('failure')), 10));
        await expect(withTimeout(promise, 50)).rejects.toThrow('failure');
    });

    it('should clear the timeout when the promise resolves first (no leaked timer)', async () => {
        vi.useFakeTimers();
        try {
            const innerPromise = new Promise((resolve) => setTimeout(() => resolve('done'), 10));
            const racePromise = withTimeout(innerPromise, 10_000);
            await vi.advanceTimersByTimeAsync(10);
            await expect(racePromise).resolves.toBe('done');
            // The 10s timeout should have been cleared; only any pending microtasks remain.
            expect(vi.getTimerCount()).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });
});
