/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ComponentType, SVGProps } from 'react';

import { AncientDragonValue } from './ancient-dragon-value';
import { ArcaneWizardValue } from './arcane-wizard-value';
import { CelestialKnightValue } from './celestial-knight-value';
import { ChaosLordValue } from './chaos-lord-value';
import { CosmicTitanValue } from './cosmic-titan-value';
import { CrystalBeetleValue } from './crystal-beetle-value';
import { DivineGuardianValue } from './divine-guardian-value';
import { DustElementalValue } from './dust-elemental-value';
import { EarthGuardianValue } from './earth-guardian-value';
import { EmberPhoenixValue } from './ember-phoenix-value';
import { EternalPhoenixValue } from './eternal-phoenix-value';
import { FlameImpValue } from './flame-imp-value';
import { ForestSpriteValue } from './forest-sprite-value';
import { FrostMageValue } from './frost-mage-value';
import { MossTrollValue } from './moss-troll-value';
import { MountainGiantValue } from './mountain-giant-value';
import { OceanSerpentValue } from './ocean-serpent-value';
import { PrimordialDragonValue } from './primordial-dragon-value';
import { RiverNymphValue } from './river-nymph-value';
import { ShadowCatValue } from './shadow-cat-value';
import { ShadowReaperValue } from './shadow-reaper-value';
import { StarGazerValue } from './star-gazer-value';
import { StoneGolemValue } from './stone-golem-value';
import { StormDrakeValue } from './storm-drake-value';
import { ThunderWolfValue } from './thunder-wolf-value';
import { UnknownCardValue } from './unknown-card-value';
import { VoidWalkerValue } from './void-walker-value';
import { WindWispValue } from './wind-wisp-value';
import { WorldSerpentValue } from './world-serpent-value';

export type CardValueSvgComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const CARD_VALUE_SVG_COMPONENTS = {
    'Forest Sprite': ForestSpriteValue,
    'Stone Golem': StoneGolemValue,
    'River Nymph': RiverNymphValue,
    'Wind Wisp': WindWispValue,
    'Earth Guardian': EarthGuardianValue,
    'Flame Imp': FlameImpValue,
    'Shadow Cat': ShadowCatValue,
    'Crystal Beetle': CrystalBeetleValue,
    'Moss Troll': MossTrollValue,
    'Dust Elemental': DustElementalValue,
    'Storm Drake': StormDrakeValue,
    'Frost Mage': FrostMageValue,
    'Thunder Wolf': ThunderWolfValue,
    'Void Walker': VoidWalkerValue,
    'Ember Phoenix': EmberPhoenixValue,
    'Ocean Serpent': OceanSerpentValue,
    'Mountain Giant': MountainGiantValue,
    'Star Gazer': StarGazerValue,
    'Ancient Dragon': AncientDragonValue,
    'Celestial Knight': CelestialKnightValue,
    'Shadow Reaper': ShadowReaperValue,
    'Arcane Wizard': ArcaneWizardValue,
    'Divine Guardian': DivineGuardianValue,
    'Chaos Lord': ChaosLordValue,
    'Eternal Phoenix': EternalPhoenixValue,
    'World Serpent': WorldSerpentValue,
    'Cosmic Titan': CosmicTitanValue,
    'Primordial Dragon': PrimordialDragonValue,
} as const satisfies Record<string, CardValueSvgComponent>;

export type CardValueName = keyof typeof CARD_VALUE_SVG_COMPONENTS;

export const getCardValueSvgComponent = (name: string): CardValueSvgComponent => {
    if (name in CARD_VALUE_SVG_COMPONENTS) {
        return CARD_VALUE_SVG_COMPONENTS[name as CardValueName];
    }

    return UnknownCardValue;
};
