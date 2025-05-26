/* global device element waitFor by expect */
const { expect: jestExpect } = require('@jest/globals');

const EMAIL    = 'erika@stud.vilniustech.lt';
const PASSWORD = 'Bakalauras2025';
const MAX_TIME = 3000;                     // 5 000 ms – NFR riba

describe('NFR-16 – Messages pradinio užkrovimo greitis', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });

        // prisijungimas
        await element(by.id('main-btn-login')).tap();
        await element(by.id('login-email')).replaceText(EMAIL);
        await element(by.id('login-password')).replaceText(PASSWORD);
        await element(by.id('login-submit')).tap();

        // footer’is = login OK
        await waitFor(element(by.id('footer-messages')))
            .toBeVisible()
            .withTimeout(7000);
    });

    it('Messages duomenys paruošti ≤ 3 s', async () => {
        const t0 = Date.now();

        await element(by.id('footer-messages')).tap();

        // laukiame inkarinio testID
        await waitFor(element(by.id('messages-loaded')))
            .toBeVisible()          // dabar jis 1×1 px, bet matomas
            .withTimeout(MAX_TIME);

        jestExpect(Date.now() - t0).toBeLessThanOrEqual(MAX_TIME);
    });
});
