require('dotenv').config();

const { expect: jestExpect } = require('@jest/globals');
const admin                  = require('firebase-admin');
const { device, element, by, waitFor } = require('detox');

const MAX_DELETE_TIME_MS = 5000;

const SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT;
const PROJECT_ID           = process.env.FIREBASE_PROJECT_ID;
const TEST_USER_EMAIL      = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD   = process.env.TEST_USER_PASSWORD;
const TEST_USER_UID        = process.env.TEST_USER_UID;

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(SERVICE_ACCOUNT_JSON)),
    projectId: PROJECT_ID,
});

describe('NFR-16 – Account Deletion End-to-End', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
        await element(by.id('main-btn-login')).tap();
        await element(by.id('login-email')).replaceText(TEST_USER_EMAIL);
        await element(by.id('login-password')).replaceText(TEST_USER_PASSWORD);
        await element(by.id('login-submit')).tap();
        await waitFor(element(by.id('footer-settings')))
            .toBeVisible()
            .withTimeout(7000);
    });

    it('should delete user account and all Firestore data in ≤ 5 seconds', async () => {
        const firestore  = admin.firestore();
        const userDocRef = firestore.collection('users').doc(TEST_USER_UID);
        const auth       = admin.auth();
        const preDeleteSnapshot = await userDocRef.get();
        jestExpect(preDeleteSnapshot.exists).toBe(true);
        await element(by.id('footer-settings')).tap();
        await element(by.id('delete-account-button')).tap();
        const t0 = Date.now();
        await element(by.text('Ištrinti')).tap();
        let docDeleted = false;
        while (Date.now() - t0 < MAX_DELETE_TIME_MS) {
            const snapshot = await userDocRef.get();
            if (!snapshot.exists) {
                docDeleted = true;
                break;
            }
            await new Promise(r => setTimeout(r, 250));
        }

        const elapsed = Date.now() - t0;
        jestExpect(docDeleted).toBe(true);
        jestExpect(elapsed).toBeLessThanOrEqual(MAX_DELETE_TIME_MS);
        let authDeleted = false;
        try {
            await auth.getUser(TEST_USER_UID);
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                authDeleted = true;
            }
        }
        jestExpect(authDeleted).toBe(true);
        await device.launchApp({ newInstance: true });
        await element(by.id('main-btn-login')).tap();
        await element(by.id('login-email')).replaceText(TEST_USER_EMAIL);
        await element(by.id('login-password')).replaceText(TEST_USER_PASSWORD);
        await element(by.id('login-submit')).tap();
        await waitFor(element(by.id('login-error')))
            .toExist()
            .withTimeout(5000);
    });
});
