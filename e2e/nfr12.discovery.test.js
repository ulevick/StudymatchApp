const { expect: jestExpect } = require('@jest/globals');
const MAX_TIME = 2000;
const EMAIL    = 'erika@stud.vilniustech.lt';
const PASSWORD = 'Bakalauras2025';
describe('NFR-12 – Discovery performance', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
        await element(by.id('main-btn-login')).tap();
        await element(by.id('login-email')).replaceText(EMAIL);
        await element(by.id('login-password')).replaceText(PASSWORD);
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
            .withTimeout(MAX_TIME);
        jestExpect(Date.now() - t0).toBeLessThanOrEqual(MAX_TIME);
    });

    it('viena kortelė nusiswipe’ina ≤ 2000 ms', async () => {
        await waitFor(element(by.id('deck-swiper')))
            .toBeVisible()
            .withTimeout(MAX_TIME);

        const t0 = Date.now();
        await element(by.id('deck-swiper')).swipe('left', 'fast', 0.8);
        jestExpect(Date.now() - t0).toBeLessThanOrEqual(MAX_TIME);
    });
});
