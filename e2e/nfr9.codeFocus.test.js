const { expect: jestExpect } = require('@jest/globals');

const MAX_LAG = 1000;
const EMAIL   = 'test@stud.vilniustech.lt';
const isIos   = device.getPlatform() === 'ios';

describe('NFR-9 – fokusas tarp kodų laukelių ≤ 1000 ms', () => {

    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
        await element(by.id('main-btn-register')).tap();
        const emailInput = element(by.id('email-input'));
        await emailInput.replaceText(EMAIL);
        await new Promise(r => setTimeout(r, 200));

        if (isIos) {
            await emailInput.tapReturnKey();
        } else {
            await device.pressBack();
        }

        await element(by.id('next-button')).tap();
        await waitFor(element(by.id('code-input-0')))
            .toBeVisible()
            .withTimeout(8000);
    });

    for (let i = 0; i < 5; i++) {
        it(`fokusas ${i} ➜ ${i + 1} ≤ ${MAX_LAG} ms`, async () => {
            await waitFor(element(by.id(`code-input-${i}`)))
                .toBeFocused()
                .withTimeout(1500);
            const t0 = Date.now();
            await element(by.id(`code-input-${i}`)).typeText(String(i + 1));
            await waitFor(element(by.id(`code-input-${i + 1}`)))
                .toBeFocused()
                .withTimeout(1000);
            jestExpect(Date.now() - t0).toBeLessThanOrEqual(MAX_LAG);
        });
    }
});
