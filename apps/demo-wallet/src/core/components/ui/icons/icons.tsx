/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const ScanIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M8 2H6C3.79086 2 2 3.79086 2 6V8M16 2H18C20.2091 2 22 3.79086 22 6V8M2 16V18C2 20.2091 3.79086 22 6 22H8M16 22H18C20.2091 22 22 20.2091 22 18V16"
            stroke="#14181F"
            strokeWidth={2}
            strokeLinecap="round"
        />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M20.5566 9.5C21.4498 11.047 21.4498 12.953 20.5566 14.5L18.4434 18.1603C17.5502 19.7073 15.8996 20.6603 14.1132 20.6603L9.88675 20.6603C8.10042 20.6603 6.44979 19.7073 5.55662 18.1603L3.44337 14.5C2.55021 12.953 2.55021 11.047 3.44338 9.5L5.55662 5.83974C6.44979 4.29274 8.10042 3.33974 9.88675 3.33974L14.1132 3.33975C15.8996 3.33975 17.5502 4.29274 18.4434 5.83975L20.5566 9.5Z"
            stroke="currentColor"
            strokeWidth={2}
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
    </svg>
);

export const SwapIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M7 19V4M10.5 7.5L7 4L3.5 7.5"
            stroke="#007AFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M17 5V20M20.5 16.5L17 20L13.5 16.5"
            stroke="#007AFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const SendIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M7 12L4.76346 18.1505C4.1393 19.8669 5.95318 21.4531 7.57106 20.6056L18.9266 14.6575C21.0706 13.5345 21.0706 10.4655 18.9266 9.34251L7.57106 3.39437C5.95318 2.5469 4.1393 4.13307 4.76346 5.84951L7 12ZM7 12L12 12"
            stroke="#007AFF"
            strokeWidth={2}
            strokeLinecap="round"
        />
    </svg>
);

export const ReceiveIcon: React.FC<IconProps> = (props) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#007AFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="m8 12 4 4 4-4" />
    </svg>
);
