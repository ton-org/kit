/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getSmartAccountAddress } from '@ton/appkit';
import type { Compute } from '@ton/appkit';

import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';
import { useAppKit } from '../../settings';
import { useAddress } from '../../wallets';

export interface UseSmartAccountAddressParameters {
    applicationAddress?: string;
    providerId?: string;
}

export type UseSmartAccountAddressReturnType = Compute<
    Omit<UseQueryReturnType<string | null>, 'data'> & {
        address: string | null;
    }
>;

/**
 * Hook for getting the smart account address.
 */
export const useSmartAccountAddress = (
    parameters: UseSmartAccountAddressParameters,
): UseSmartAccountAddressReturnType => {
    const { applicationAddress, providerId } = parameters;
    const appKit = useAppKit();
    const address = useAddress();

    const { data, ...rest } = useQuery({
        queryKey: ['cross-chain', 'smart-account', address, applicationAddress, providerId],
        queryFn: async () => {
            if (!providerId || !applicationAddress || !address) {
                return null;
            }
            return getSmartAccountAddress(appKit, { applicationAddress, providerId });
        },
        enabled: !!providerId && !!applicationAddress && !!address,
    });

    return { address: data, ...rest } as UseSmartAccountAddressReturnType;
};
