/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Buffer } from 'buffer';

import { extendAllGlobals } from './utils';

extendAllGlobals({
    Buffer,
    SharedArrayBuffer: class {
        get byteLength() {
            return 0;
        }
        get growable() {
            return false;
        }
    },
});
