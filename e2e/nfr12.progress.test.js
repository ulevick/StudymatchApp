/* global device element by waitFor */
const { expect: jestExpect } = require('@jest/globals');

describe('NFR-12 – progress bar ≤ 0.5 s', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
        await element(by.id('main-btn-register')).tap();   // Main → Reg_Stud1
    });

    it('animacija baigiasi per ≤ 500 ms', async () => {
        const t0 = Date.now();

        await waitFor(element(by.id('progress-done')))
            .toBeVisible()
            .withTimeout(1000);          // saugi riba, bet laikas matuojam patys

        jestExpect(Date.now() - t0).toBeLessThanOrEqual(500);
    });
});
