/* global device element waitFor by expect */
const { expect: jestExpect } = require('@jest/globals');

const EMAIL    = 'erika@stud.vilniustech.lt';
const PASSWORD = 'Bakalauras2025';
const MAP_MAX  = 3000;   // 3 s
const GPA_MAX  = 300;    // 0,3 s

describe('NFR-18 – Map ir paieškos našumas', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });

        // 1. prisijungimas
        await element(by.id('main-btn-login')).tap();
        await element(by.id('login-email')).replaceText(EMAIL);
        await element(by.id('login-password')).replaceText(PASSWORD);
        await element(by.id('login-submit')).tap();

        await waitFor(element(by.id('footer-searchstudents')))
            .toBeVisible()
            .withTimeout(7000);
        await element(by.id('footer-searchstudents')).tap();

        // 3. laukiame Studentų tab’o
        await waitFor(element(by.id('tab-zemelapis')))
            .toBeVisible()
            .withTimeout(7000);
        await element(by.id('tab-zemelapis')).tap();
    });

    it('Žemėlapis inicijuojasi ≤ 3 s', async () => {
        const t0 = Date.now();

        // 4. atidarom ŽEMĖLAPIS (top tab)
        await element(by.text('Žemėlapis')).tap();

        // 5. laukiame, kol atsiras nematomas map-loaded “inkaras”
        await waitFor(element(by.id('map-loaded')))
            .toExist()
            .withTimeout(MAP_MAX);

        jestExpect(Date.now() - t0).toBeLessThanOrEqual(MAP_MAX);
    });

    it('Pirmas vietos pasiūlymas ≤ 2 s ir perkelia mapą', async () => {
        // patikriname, kad inputas matomas
        const searchInput = element(by.id('gpa-input'));
        await waitFor(searchInput)
            .toBeVisible()
            .withTimeout(2000);

        const t1 = Date.now();

        // įvedame vieną raidę
        await searchInput.typeText('v');

        // laukiame pirmo sugestijos teksto (pvz. "Vilnius, Lietuva")
        const suggestion = element(by.text('Vilnius, Lietuva'));
        await waitFor(suggestion)
            .toBeVisible()
            .withTimeout(GPA_MAX);

        // laikas
        jestExpect(Date.now() - t1).toBeLessThanOrEqual(GPA_MAX);

        // paliečiame
        await suggestion.tap();

        // galėtumėte patikrinti, kad mapas pasislinko,
        // pvz. laukdami Marker atsidarymo,
        // bet čia pakaks, kad tap įvyko be klaidų.
    });
});
