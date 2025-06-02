const { expect: jestExpect } = require('@jest/globals');
const EMAIL     = 'test@stud.vilniustech.lt';
const MAX_TIME  = 3000;
const isIos     = device.getPlatform() === 'ios';

describe('NFR-10 – laiško su kodu siuntimas ≤ 3 s', () => {

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
    });

    it('laiko intervalas Toliau ➜ Reg_Stud2 ≤ 3 s', async () => {
        const t0 = Date.now();
        await element(by.id('next-button')).tap();
        await waitFor(element(by.id('code-input-0')))
            .toBeVisible()
            .withTimeout(MAX_TIME);
        jestExpect(Date.now() - t0).toBeLessThanOrEqual(MAX_TIME);
    });
});
