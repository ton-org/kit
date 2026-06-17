/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { feature, label } from 'allure-js-commons';

/**
 * Attach grouping metadata to the current test, mirroring the demo-wallet e2e
 * convention (`feature` + `sub-suite`). The top-level `Suite` custom field is left
 * to allure-playwright's file-path default, so the gasless specs sit in the TestOps
 * tree the same way the existing minter specs do.
 *
 * @param subSuite  area name, e.g. "Transfer", "Mint", "Relayer errors".
 */
export async function gaslessMeta(subSuite: string): Promise<void> {
    await feature('Gasless');
    await label('sub-suite', subSuite);
}
