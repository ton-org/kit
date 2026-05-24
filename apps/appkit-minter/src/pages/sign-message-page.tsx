/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useSignText, useSelectedWallet } from '@ton/appkit-react';
import { toast } from 'sonner';

import { Layout } from '@/core/components';

export const SignMessagePage: FC = () => {
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState<string | null>(null);

    const [wallet] = useSelectedWallet();
    const { mutate: signText, isPending } = useSignText({
        mutation: {
            onSuccess: (result) => {
                setSignature(result.signature);
                toast.success('Message signed successfully!');
            },
            onError: (error) => {
                toast.error(`Signing failed: ${error.message}`);
            },
        },
    });

    const handleSign = () => {
        if (!wallet || !message.trim()) {
            toast.error('Please enter a message to sign');
            return;
        }

        signText({ text: message });
    };

    const handleCopySignature = () => {
        if (signature) {
            navigator.clipboard.writeText(signature);
            toast.success('Signature copied to clipboard!');
        }
    };

    return (
        <Layout title="Sign Message">
            <div className="w-full max-w-[488px] mx-auto p-6 space-y-4 rounded-2xl border border-border bg-card">
                <h2 className="text-xl font-semibold">Sign Message</h2>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Message to sign</label>
                    <textarea
                        className="w-full p-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                        placeholder="Enter your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isPending}
                    />
                </div>

                <button
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50"
                    onClick={handleSign}
                    disabled={!wallet || !message.trim() || isPending}
                >
                    {isPending ? 'Signing...' : 'Sign Message'}
                </button>

                {signature && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Signature</label>
                        <div className="p-3 bg-muted border border-border rounded-lg break-all text-xs font-mono">
                            {signature}
                        </div>
                        <button
                            className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg text-sm"
                            onClick={handleCopySignature}
                        >
                            Copy Signature
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};
