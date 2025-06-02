const { expect: jestExpect } = require('@jest/globals');
const EMAIL    = 'erika@stud.vilniustech.lt';
const PASSWORD = 'Bakalauras2025';
const MAX_TIME = 3000;

describe('NFR-11 – Messages pradinio užkrovimo greitis', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
        await element(by.id('main-btn-login')).tap();
        await element(by.id('login-email')).replaceText(EMAIL);
        await element(by.id('login-password')).replaceText(PASSWORD);
        await element(by.id('login-submit')).tap();
        await waitFor(element(by.id('footer-messages')))
            .toBeVisible()
            .withTimeout(7000);
    });

    it('Messages duomenys paruošti ≤ 3 s', async () => {
        const t0 = Date.now();
        await element(by.id('footer-messages')).tap();
        await waitFor(element(by.id('messages-loaded')))
            .toBeVisible()
            .withTimeout(MAX_TIME);
        jestExpect(Date.now() - t0).toBeLessThanOrEqual(MAX_TIME);
    });
});
