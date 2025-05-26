/* global device element waitFor by expect */
const { expect: jestExpect } = require('@jest/globals');

const EMAIL     = 'test@stud.vilniustech.lt';   // leistinas domenas
const MAX_TIME  = 3000;                         // 3 000 ms
const isIos     = device.getPlatform() === 'ios';

describe('NFR-15 – laiško su kodu siuntimas ≤ 3 s', () => {

    beforeAll(async () => {
        /* 0. švari programos instancija (BE „skip network“) */
        await device.launchApp({ newInstance: true });

        /* 1. registracijos pradžia */
        await element(by.id('main-btn-register')).tap();

        /* 2. el. pašto įvedimas */
        const emailInput = element(by.id('email-input'));
        await emailInput.replaceText(EMAIL);

        /* -- trumpas “kvėptelėjimas”, kad React nuimtų disabled -- */
        await new Promise(r => setTimeout(r, 200));

        /* 3. paslepiame klaviatūrą, kad mygtukas būtų „hittable” */
        if (isIos) {
            await emailInput.tapReturnKey();
        } else {
            await device.pressBack();
        }
    });

    it('laiko intervalas Toliau ➜ Reg_Stud2 ≤ 3 s', async () => {
        const t0 = Date.now();

        /* 4. spaudžiame „Toliau“ (trigger’is handleNext → Firebase) */
        await element(by.id('next-button')).tap();

        /* 5. laukiame, kol matysis pirmas kodų laukelis */
        await waitFor(element(by.id('code-input-0')))
            .toBeVisible()
            .withTimeout(MAX_TIME);   // viršutinė riba – 3 s

        /* 6. tikriname, kad neviršijo 3 000 ms */
        jestExpect(Date.now() - t0).toBeLessThanOrEqual(MAX_TIME);
    });
});
