/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useRef, useState } from 'react';

/** Ease-out cubic for smooth deceleration at the end. */
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Animate a number from its previous value to `target` (count-up / odometer
 * roll). Returns the current animated value, updated each frame.
 */
export const useCountUp = (target: number, durationMs = 600): number => {
    const [value, setValue] = useState(target);
    const fromRef = useRef(target);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const start = fromRef.current;
        const end = target;

        if (Math.abs(start - end) < 1e-9) {
            fromRef.current = end;
            setValue(end);
            return;
        }

        const startTime = performance.now();
        const tick = (now: number) => {
            const progress = Math.min((now - startTime) / durationMs, 1);
            const current = start + (end - start) * easeOutCubic(progress);
            fromRef.current = current;
            setValue(current);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                fromRef.current = end;
                setValue(end);
            }
        };

        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [target, durationMs]);

    return value;
};
