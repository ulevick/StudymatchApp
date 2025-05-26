/* global device element by waitFor */
const { expect: jestExpect } = require('@jest/globals');

describe('NFR-17 – Discovery performance', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });

        await element(by.id('main-btn-login')).tap();
        await element(by.id('login-email')).replaceText('erika@stud.vilniustech.lt');
        await element(by.id('login-password')).replaceText('Bakalauras2025');
        await element(by.id('login-submit')).tap();

        await waitFor(element(by.id('footer-searchstudents')))
            .toBeVisible()
            .withTimeout(7000);
        await element(by.id('footer-searchstudents')).tap();

        await waitFor(element(by.id('tab-studentai')))
            .toBeVisible()
            .withTimeout(7000);
        await element(by.id('tab-studentai')).tap();
    });

    it('kortelių „stackas“ paruoštas ≤ 2 s', async () => {
        const t0 = Date.now();
        await waitFor(element(by.id('deck-swiper')))
            .toBeVisible()
            .withTimeout(2000);
        jestExpect(Date.now() - t0).toBeLessThanOrEqual(2000);
    });

    it('viena kortelė nusiswipe’ina ≤ 2000 ms', async () => {
        await waitFor(element(by.id('deck-swiper')))
            .toBeVisible()
            .withTimeout(2000);

        const t0 = Date.now();
        await element(by.id('deck-swiper')).swipe('left', 'fast', 0.8);
        jestExpect(Date.now() - t0).toBeLessThanOrEqual(2000);
    });
});
