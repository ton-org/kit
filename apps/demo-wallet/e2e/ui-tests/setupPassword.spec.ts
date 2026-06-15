/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { expect } from '@playwright/test';
import { step } from 'allure-js-commons';

import { SetupPasswordPage, SetupWalletPage } from '../pages';
import { testWithUIFixture } from './UITestFixture';
import { TEST_PASSWORD, LONG_PASSWORD, XSS_PASSWORD_PAYLOAD } from '../constants';

const test = testWithUIFixture().extend<{
    setupPassword: SetupPasswordPage;
    setupWallet: SetupWalletPage;
}>({
    setupPassword: async ({ page }, use) => {
        await use(new SetupPasswordPage(page));
    },
    setupWallet: async ({ page }, use) => {
        await use(new SetupWalletPage(page));
    },
});

test.describe('SetupPassword', () => {
    test.beforeEach(async ({ page, setupPassword }) => {
        // The redesign starts on Welcome; "Create a new wallet" leads to the password screen.
        await page.getByTestId('welcome-create').click();
        await setupPassword.waitForPage();
    });

    test.describe('display', () => {
        test('page renders correctly', async ({ setupPassword }) => {
            await step('Verify subtitle contains "Create a password"', async () => {
                await expect(setupPassword.subtitle).toHaveText('Create a password');
            });
            await step('Verify password input is visible', async () => {
                await expect(setupPassword.passwordInput).toBeVisible();
            });
            await step('Verify confirm password input is visible', async () => {
                await expect(setupPassword.confirmInput).toBeVisible();
            });
        });

        test('continue button is disabled on load', async ({ setupPassword }) => {
            await step('Verify submit button is disabled', async () => {
                await expect(setupPassword.submitButton).toBeDisabled();
            });
        });

        test('helper text is visible', async ({ setupPassword }) => {
            await step('Verify the "remember your password" helper is visible', async () => {
                await expect(setupPassword.helperText).toBeVisible();
            });
        });

        test('password fields have type password', async ({ setupPassword }) => {
            await step('Verify password input has type="password"', async () => {
                await expect(setupPassword.passwordInput).toHaveAttribute('type', 'password');
            });
            await step('Verify confirm input has type="password"', async () => {
                await expect(setupPassword.confirmInput).toHaveAttribute('type', 'password');
            });
        });

        test('page reload stays on /setup-password when no password is set', async ({
            webOnly: _webOnly,
            setupPassword,
            page,
        }) => {
            await step('Reload the page', async () => {
                await page.reload({ waitUntil: 'load' });
            });
            await step('Verify Setup Password page is still displayed', async () => {
                await setupPassword.waitForPage();
            });
        });
    });

    test.describe('disabled state', () => {
        test('button disabled when only password is filled', async ({ setupPassword }) => {
            await step('Fill only the password field', async () => {
                await setupPassword.fillPassword(TEST_PASSWORD);
            });
            await step('Verify submit button is disabled', async () => {
                await expect(setupPassword.submitButton).toBeDisabled();
            });
        });

        test('button disabled when only confirm is filled', async ({ setupPassword }) => {
            await step('Fill only the confirm field', async () => {
                await setupPassword.fillConfirm(TEST_PASSWORD);
            });
            await step('Verify submit button is disabled', async () => {
                await expect(setupPassword.submitButton).toBeDisabled();
            });
        });
    });

    test.describe('validation errors', () => {
        test('error when password is less than 4 characters', async ({ setupPassword, page }) => {
            // Submit stays disabled for an invalid password, so the hint shows on input (no click).
            await step('Type a password shorter than 4 characters', async () => {
                await setupPassword.fillPassword('ab');
            });
            await step('Verify error contains "Password must be at least 4 characters"', async () => {
                await expect(page.getByText('Password must be at least 4 characters')).toBeVisible();
            });
        });

        test('error when passwords do not match', async ({ setupPassword, page }) => {
            await step('Type mismatched passwords', async () => {
                await setupPassword.fillPassword(TEST_PASSWORD);
                await setupPassword.fillConfirm('diff');
            });
            await step('Verify error contains "Passwords do not match"', async () => {
                await expect(page.getByText('Passwords do not match')).toBeVisible();
            });
        });

        test('fields retain values after error', async ({ setupPassword }) => {
            await step('Type a password shorter than 4 characters', async () => {
                await setupPassword.fillPassword('ab');
                await setupPassword.fillConfirm('ab');
            });
            await step('Verify password field retains its value', async () => {
                await expect(setupPassword.passwordInput).toHaveValue('ab');
            });
            await step('Verify confirm field retains its value', async () => {
                await expect(setupPassword.confirmInput).toHaveValue('ab');
            });
        });
    });

    test.describe('positive', () => {
        test('valid password redirects to the recovery-phrase screen', async ({ setupPassword, setupWallet }) => {
            await step('Submit valid password', async () => {
                await setupPassword.submit(TEST_PASSWORD);
            });
            await step('Verify the recovery-phrase (create-wallet) screen is displayed', async () => {
                await setupWallet.waitForPage();
            });
        });
    });

    test.describe('localStorage', () => {
        test('auth state is persisted correctly after submit', async ({ setupPassword, setupWallet }) => {
            await step('Submit valid password', async () => {
                await setupPassword.submit(TEST_PASSWORD);
            });
            await step('Wait for the recovery-phrase screen', async () => {
                await setupWallet.waitForPage();
            });

            const store = await setupPassword.getStore();
            await step('Verify auth.isPasswordSet is true in localStorage', async () => {
                expect(store.state.auth.isPasswordSet).toBe(true);
            });
            await step('Verify auth.passwordHash is saved in localStorage', async () => {
                expect(Array.isArray(store.state.auth.passwordHash)).toBe(true);
                expect(store.state.auth.passwordHash.length).toBeGreaterThan(0);
            });
            await step('Verify auth.currentPassword is not persisted in localStorage', async () => {
                expect(store.state.auth.currentPassword).toBeUndefined();
            });
        });
    });

    test.describe('edge cases', () => {
        test('very long password (500 chars) is accepted', async ({ setupPassword, setupWallet }) => {
            await step('Submit 500-character password', async () => {
                await setupPassword.submit(LONG_PASSWORD);
            });
            await step('Verify the recovery-phrase screen is displayed', async () => {
                await setupWallet.waitForPage();
            });
        });

        test('pasted password is validated correctly', async ({ setupPassword, setupWallet, context }) => {
            await step('Grant clipboard permissions', async () => {
                await context.grantPermissions(['clipboard-read', 'clipboard-write']);
            });
            await step('Paste and submit password', async () => {
                await setupPassword.submitByPasting(TEST_PASSWORD);
            });
            await step('Verify the recovery-phrase screen is displayed', async () => {
                await setupWallet.waitForPage();
            });
        });

        test('XSS attempt in password field is treated as plain text', async ({ setupPassword, setupWallet, page }) => {
            // React escapes HTML in input values, so <script> tags are rendered as plain text.
            // If XSS were executed, the browser would fire a native alert() dialog.
            // page.on('dialog') intercepts any browser-level dialog — if it triggers, the test fails.
            let dialogTriggered = false;
            page.on('dialog', async (dialog) => {
                dialogTriggered = true;
                await dialog.dismiss();
            });

            await step('Submit XSS payload as password', async () => {
                await setupPassword.submit(XSS_PASSWORD_PAYLOAD);
            });
            await step('Verify the recovery-phrase screen is displayed', async () => {
                await setupWallet.waitForPage();
            });
            await step('Verify no XSS dialog was triggered', async () => {
                expect(dialogTriggered, 'XSS script was executed').toBe(false);
            });
        });
    });
});
