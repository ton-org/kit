/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { BaseProvider } from '../api/models';

/**
 * A provider with custom functionality registered by a third party.
 * Extend this interface to add your own methods.
 *
 * @example
 * interface MyCustomProvider extends CustomProvider {
 *     customAction(params: CustomParams): Promise<void>;
 * }
 */
export interface CustomProvider extends BaseProvider {
    readonly type: 'custom';
}
