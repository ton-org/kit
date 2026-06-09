/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { getCardValueSvgComponent } from '../components/card-values';
import { RarityValues, RARITY_CONFIGS } from '../types/card';
import type { CardData, Rarity } from '../types/card';

import { generateId } from '@/core/lib/utils';

// Card names organized by rarity
export const CARD_NAMES: Record<Rarity, string[]> = {
    [RarityValues.Common]: [
        'Forest Sprite',
        'Stone Golem',
        'River Nymph',
        'Wind Wisp',
        'Earth Guardian',
        'Flame Imp',
        'Shadow Cat',
        'Crystal Beetle',
        'Moss Troll',
        'Dust Elemental',
    ],
    [RarityValues.Rare]: [
        'Storm Drake',
        'Frost Mage',
        'Thunder Wolf',
        'Void Walker',
        'Ember Phoenix',
        'Ocean Serpent',
        'Mountain Giant',
        'Star Gazer',
    ],
    [RarityValues.Epic]: [
        'Ancient Dragon',
        'Celestial Knight',
        'Shadow Reaper',
        'Arcane Wizard',
        'Divine Guardian',
        'Chaos Lord',
    ],
    [RarityValues.Legendary]: ['Eternal Phoenix', 'World Serpent', 'Cosmic Titan', 'Primordial Dragon'],
};

// Card descriptions by rarity
export const CARD_DESCRIPTIONS: Record<Rarity, string[]> = {
    [RarityValues.Common]: [
        'A humble creature of the wild.',
        'Born from the elements themselves.',
        'A faithful companion on any journey.',
    ],
    [RarityValues.Rare]: [
        'A powerful being with hidden potential.',
        'Sought after by collectors across the realm.',
        'Wielding magic beyond ordinary means.',
    ],
    [RarityValues.Epic]: [
        'A legendary creature of immense power.',
        'Few have witnessed such magnificence.',
        'Ancient magic flows through its veins.',
    ],
    [RarityValues.Legendary]: [
        'A mythical being of unparalleled power.',
        'Said to exist only in legends.',
        'The rarest of all creatures in existence.',
    ],
};

/**
 * Get a random rarity based on configured weights
 */
export const getRandomRarity = (): Rarity => {
    const totalWeight = Object.values(RARITY_CONFIGS).reduce((sum, config) => sum + config.weight, 0);
    let random = Math.random() * totalWeight;

    for (const rarity of Object.values(RarityValues)) {
        const config = RARITY_CONFIGS[rarity];
        if (random < config.weight) {
            return rarity;
        }
        random -= config.weight;
    }

    return RarityValues.Common;
};

/**
 * Get a random name for a given rarity
 */
export const getRandomName = (rarity: Rarity): string => {
    const names = CARD_NAMES[rarity];
    return names[Math.floor(Math.random() * names.length)];
};

/**
 * Get a random description for a given rarity
 */
export const getRandomDescription = (rarity: Rarity): string => {
    const descriptions = CARD_DESCRIPTIONS[rarity];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
};

interface RgbColor {
    r: number;
    g: number;
    b: number;
}

interface CardBackground {
    startColor: string;
    endColor: string;
    shineColor: string;
    shineX: number;
    shineY: number;
    shineRadius: number;
    gradientX1: number;
    gradientY1: number;
    gradientX2: number;
    gradientY2: number;
}

const hexToRgb = (hex: string): RgbColor => {
    const color = Number.parseInt(hex.replace('#', ''), 16);

    return {
        r: (color >> 16) & 255,
        g: (color >> 8) & 255,
        b: color & 255,
    };
};

const toHexChannel = (value: number): string => Math.round(value).toString(16).padStart(2, '0');

const rgbToHex = ({ r, g, b }: RgbColor): string => `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;

const mixColor = (fromHex: string, toHex: string, amount: number): string => {
    const from = hexToRgb(fromHex);
    const to = hexToRgb(toHex);

    return rgbToHex({
        r: from.r + (to.r - from.r) * amount,
        g: from.g + (to.g - from.g) * amount,
        b: from.b + (to.b - from.b) * amount,
    });
};

const randomInt = (min: number, max: number): number => Math.round(min + Math.random() * (max - min));

const getRandomCardBackground = (color: string): CardBackground => ({
    startColor: mixColor(color, '#ffffff', 0.24),
    endColor: mixColor(color, '#000000', 0.2),
    shineColor: mixColor(color, '#ffffff', 0.78),
    shineX: randomInt(52, 248),
    shineY: randomInt(42, 144),
    shineRadius: randomInt(34, 66),
    gradientX1: randomInt(0, 28),
    gradientY1: randomInt(0, 28),
    gradientX2: randomInt(72, 100),
    gradientY2: randomInt(72, 100),
});

const getCardValueMarkup = (name: string): string => {
    const CardValueSvg = getCardValueSvgComponent(name);
    const svgMarkup = renderToStaticMarkup(createElement(CardValueSvg));
    const valueMarkup = svgMarkup
        .replace(/^<svg[^>]*>/, '')
        .replace(/<\/svg>$/, '')
        .replace(/<title>.*?<\/title>/, '')
        .replaceAll('currentColor', '#ffffff');

    return `<g transform="translate(62 62) scale(1.1)" fill="none">${valueMarkup}</g>`;
};

/**
 * Generate an inline SVG image URL based on rarity and component-based value art
 */
export const getCardImageUrl = (rarity: Rarity, name: string): string => {
    const config = RARITY_CONFIGS[rarity];
    const background = getRandomCardBackground(config.color);
    const valueMarkup = getCardValueMarkup(name);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <defs>
            <linearGradient id="card-bg" x1="${background.gradientX1}%" y1="${background.gradientY1}%" x2="${background.gradientX2}%" y2="${background.gradientY2}%">
                <stop offset="0%" stop-color="${background.startColor}"/>
                <stop offset="52%" stop-color="${config.color}"/>
                <stop offset="100%" stop-color="${background.endColor}"/>
            </linearGradient>
            <radialGradient id="card-shine" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.72"/>
                <stop offset="45%" stop-color="${background.shineColor}" stop-opacity="0.28"/>
                <stop offset="100%" stop-color="${background.shineColor}" stop-opacity="0"/>
            </radialGradient>
        </defs>
        <rect width="300" height="300" rx="28" fill="url(#card-bg)"/>
        <circle cx="${background.shineX}" cy="${background.shineY}" r="${background.shineRadius}" fill="url(#card-shine)"/>
        <rect x="28" y="28" width="244" height="244" rx="28" fill="#ffffff" opacity="0.1"/>
        <rect x="28" y="28" width="244" height="244" rx="28" fill="none" stroke="#ffffff" stroke-opacity="0.26" stroke-width="2"/>
        <path d="M39 236C93 262 207 262 261 236" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>
        <ellipse cx="150" cy="240" rx="72" ry="13" fill="#000000" opacity="0.13"/>
        ${valueMarkup}
    </svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const createRandomCard = (): CardData => {
    const rarity = getRandomRarity();
    const name = getRandomName(rarity);

    return {
        id: generateId(),
        name,
        rarity,
        description: getRandomDescription(rarity),
        imageUrl: getCardImageUrl(rarity, name),
        createdAt: Date.now(),
    };
};
