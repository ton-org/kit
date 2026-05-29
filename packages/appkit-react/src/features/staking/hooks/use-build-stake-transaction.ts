/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { UseMutationResult } from '@tanstack/react-query';
import { buildStakeTransactionMutationOptions } from '@ton/appkit/queries';
import type {
    BuildStakeTransactionData,
    BuildStakeTransactionErrorType,
    BuildStakeTransactionMutationOptions,
    BuildStakeTransactionVariables,
} from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useMutation } from '../../../libs/query';

export type UseBuildStakeTransactionParameters<context = unknown> = BuildStakeTransactionMutationOptions<context>;

export type UseBuildStakeTransactionReturnType<context = unknown> = UseMutationResult<
    BuildStakeTransactionData,
    BuildStakeTransactionErrorType,
    BuildStakeTransactionVariables,
    context
>;

/**
 * Hook to build stake transaction
 */
export const useBuildStakeTransaction = <context = unknown>(
    parameters?: UseBuildStakeTransactionParameters<context>,
): UseBuildStakeTransactionReturnType<context> => {
    const appKit = useAppKit();
    return useMutation(buildStakeTransactionMutationOptions<context>(appKit, parameters));
};
