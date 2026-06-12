/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { FC, ComponentProps } from 'react';

import { cn } from '@/core/lib/utils';

const MIN_FONT_SCALE = 0.5;
// Mirrors appkit-react's --ta-input-xl* tokens (amount 60px / ticker 40px, weight 700).
const INPUT_FONT = '60px';
const INPUT_LINE_HEIGHT = '68px';
const TICKER_FONT = '40px';

export interface CenteredAmountInputProps extends ComponentProps<'div'> {
    value: string;
    onValueChange: (value: string) => void;
    ticker?: string;
    symbol?: string;
    placeholder?: string;
    /** Base test id; the inner <input> gets `${baseTestId}-input` (e.g. "send-amount" → "send-amount-input"). */
    baseTestId?: string;
}

/** Big centered amount input whose font shrinks to fit the available width (ported from appkit-react). */
export const CenteredAmountInput: FC<CenteredAmountInputProps> = ({
    value,
    onValueChange,
    ticker,
    symbol,
    placeholder = '0',
    className,
    baseTestId,
    ...props
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const measureRowRef = useRef<HTMLDivElement>(null);
    const mirrorRef = useRef<HTMLSpanElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);
    const [fontScale, setFontScale] = useState(1);

    const adjustSize = useCallback(() => {
        const wrapper = wrapperRef.current;
        const measureRow = measureRowRef.current;
        const mirror = mirrorRef.current;
        if (!wrapper || !measureRow || !mirror) return;

        const contentWidth = measureRow.offsetWidth;
        const availableWidth = wrapper.clientWidth - 4;

        let scale = 1;
        if (contentWidth > 0 && contentWidth > availableWidth) {
            scale = Math.max(MIN_FONT_SCALE, availableWidth / contentWidth);
        }

        setFontScale(scale);
        setInputWidth(mirror.offsetWidth * scale + 4);
    }, []);

    useLayoutEffect(adjustSize, [value, placeholder, symbol, ticker, adjustSize]);

    useLayoutEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const observer = new ResizeObserver(adjustSize);
        observer.observe(wrapper);
        return () => observer.disconnect();
    }, [adjustSize]);

    const inputFontSize = fontScale < 1 ? `calc(${INPUT_FONT} * ${fontScale})` : INPUT_FONT;
    const tickerFontSize = fontScale < 1 ? `calc(${TICKER_FONT} * ${fontScale})` : TICKER_FONT;

    return (
        <div
            ref={wrapperRef}
            className={cn('relative flex w-full cursor-text flex-col items-center overflow-hidden', className)}
            onClick={() => inputRef.current?.focus()}
            {...props}
        >
            {/* Hidden row that measures the full content width at the base font. */}
            <div
                ref={measureRowRef}
                className="pointer-events-none invisible absolute flex items-baseline whitespace-nowrap font-bold"
                aria-hidden="true"
            >
                {symbol && <span style={{ fontSize: INPUT_FONT }}>{symbol}</span>}
                <span style={{ fontSize: INPUT_FONT }}>{value || placeholder}</span>
                {ticker && <span style={{ fontSize: TICKER_FONT }}>{ticker}</span>}
            </div>

            <div className="flex max-w-full items-baseline font-bold">
                {symbol && (
                    <span
                        className="select-none whitespace-nowrap text-gray-400"
                        style={{ fontSize: inputFontSize, lineHeight: INPUT_LINE_HEIGHT }}
                    >
                        {symbol}
                    </span>
                )}
                <input
                    ref={inputRef}
                    data-testid={baseTestId ? `${baseTestId}-input` : undefined}
                    className="min-w-[24px] max-w-full border-0 bg-transparent p-0 text-right text-gray-900 outline-none placeholder:text-gray-400"
                    type="text"
                    inputMode="decimal"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    style={{
                        width: inputWidth ? `${inputWidth}px` : undefined,
                        fontSize: inputFontSize,
                        lineHeight: INPUT_LINE_HEIGHT,
                        boxSizing: 'content-box',
                    }}
                />
                {ticker && (
                    <span
                        className="ml-[0.2em] select-none whitespace-nowrap text-gray-400"
                        style={{ fontSize: tickerFontSize, lineHeight: 1 }}
                    >
                        {ticker}
                    </span>
                )}
            </div>

            {/* Hidden mirror that measures the input text width at the base font. */}
            <span
                ref={mirrorRef}
                className="pointer-events-none invisible absolute whitespace-nowrap font-bold"
                style={{ fontSize: INPUT_FONT }}
                aria-hidden="true"
            >
                {value || placeholder}
            </span>
        </div>
    );
};
