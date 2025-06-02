const { expect: jestExpect } = require('@jest/globals');
const MAX_TIME  = 1000;
describe('NFR-8 – progress bar ≤ 0.5 s', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
        await element(by.id('main-btn-register')).tap();
    });

    it('animacija baigiasi per ≤ 500 ms', async () => {
        const t0 = Date.now();

        await waitFor(element(by.id('progress-done')))
            .toBeVisible()
            .withTimeout(MAX_TIME);
        jestExpect(Date.now() - t0).toBeLessThanOrEqual(500);
    });
});
