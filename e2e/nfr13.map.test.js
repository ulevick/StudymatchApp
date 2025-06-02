const { expect: jestExpect } = require('@jest/globals');
const EMAIL    = 'erika@stud.vilniustech.lt';
const PASSWORD = 'Bakalauras2025';
const MAP_MAX  = 3000;
const GPA_MAX  = 300;

describe('NFR-13 – Map ir paieškos našumas', () => {
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
        await waitFor(element(by.id('tab-zemelapis')))
            .toBeVisible()
            .withTimeout(7000);
        await element(by.id('tab-zemelapis')).tap();
    });

    it('Žemėlapis inicijuojasi ≤ 3 s', async () => {
        const t0 = Date.now();
        await element(by.text('Žemėlapis')).tap();
        await waitFor(element(by.id('map-loaded')))
            .toExist()
            .withTimeout(MAP_MAX);
        jestExpect(Date.now() - t0).toBeLessThanOrEqual(MAP_MAX);
    });

    it('Pirmas vietos pasiūlymas ≤ 2 s ir perkelia mapą', async () => {
        const searchInput = element(by.id('gpa-input'));
        await waitFor(searchInput)
            .toBeVisible()
            .withTimeout(2000);
        const t1 = Date.now();
        await searchInput.typeText('v');
        const suggestion = element(by.text('Vilnius, Lietuva'));
        await waitFor(suggestion)
            .toBeVisible()
            .withTimeout(GPA_MAX);
        jestExpect(Date.now() - t1).toBeLessThanOrEqual(GPA_MAX);
        await suggestion.tap();
    });
});
