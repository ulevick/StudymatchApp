/* global device element waitFor by expect */
const { expect: jestExpect } = require('@jest/globals');

const MAX_LAG = 1000;                                 // 0,05 s
const EMAIL   = 'test@stud.vilniustech.lt';         // galiojantis domenas
const isIos   = device.getPlatform() === 'ios';

describe('NFR-14 – fokusas tarp kodų laukelių ≤ 1000 ms', () => {

    beforeAll(async () => {
        /* 0. naujas programos instancijos paleidimas */
        await device.launchApp({ newInstance: true });

        /* 1. registracijos pradžia */
        await element(by.id('main-btn-register')).tap();

        /* 2. įvedame el. paštą */
        const emailInput = element(by.id('email-input'));
        await emailInput.replaceText(EMAIL);

        /* 3. DUODAME 200 ms UI persirenderinti,
              kad mygtukas spėtų pasidaryti „enabled“ */
        await new Promise(r => setTimeout(r, 200));

        /* 4. paslepiame klaviatūrą, kad neuždengtų mygtuko */
        if (isIos) {
            await emailInput.tapReturnKey();   // iOS
        } else {
            await device.pressBack();          // Android
        }

        /* 5. spaudžiame „Toliau“ */
        await element(by.id('next-button')).tap();

        /* 6. laukiame Reg_Stud2 ekrano */
        await waitFor(element(by.id('code-input-0')))
            .toBeVisible()
            .withTimeout(8000);                // tinklo nėra – tiek pakanka
    });

    /* 7. matuojame fokusų persijungimą tarp 6 laukelių */
    for (let i = 0; i < 5; i++) {
        it(`fokusas ${i} ➜ ${i + 1} ≤ ${MAX_LAG} ms`, async () => {

            // laukelis i turi turėti fokusą
            await waitFor(element(by.id(`code-input-${i}`)))
                .toBeFocused()
                .withTimeout(1500);

            const t0 = Date.now();

            // įvedame skaitmenį
            await element(by.id(`code-input-${i}`)).typeText(String(i + 1));

            // laukelis i+1 turi perimti fokusą
            await waitFor(element(by.id(`code-input-${i + 1}`)))
                .toBeFocused()
                .withTimeout(1000);               // 0,4 s – sočiai

            // tikriname, kad persijungimas < MAX_LAG
            jestExpect(Date.now() - t0).toBeLessThanOrEqual(MAX_LAG);
        });
    }
});
