require('dotenv').config();

const { expect: jestExpect } = require('@jest/globals');
const admin                  = require('firebase-admin');
const { device, element, by, waitFor } = require('detox');
const serviceAccount = require('./serviceAccountKey.json');

const LOCATION_FIELD_TIMEOUT = 7000;
const PROJECT_ID         = process.env.FIREBASE_PROJECT_ID;
const TEST_USER_EMAIL    = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
const TEST_USER_UID      = process.env.TEST_USER_UID;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: PROJECT_ID,
});

describe('NFR-15 – Location Consent Behavior', () => {
    const firestore  = admin.firestore();
    const userDocRef = firestore.collection('users').doc(TEST_USER_UID);
    async function resetUserLocationFields() {
        await userDocRef.update({
            location: admin.firestore.FieldValue.delete(),
            locationUpdatedAt: admin.firestore.FieldValue.delete(),
        });
    }

    beforeEach(async () => {
        await resetUserLocationFields();
    });

    it('should NOT write any location fields to Firestore when permission is denied', async () => {
        await device.launchApp({
            newInstance: true,
            permissions: { location: device.getPlatform() === 'ios' ? 'never' : 'deny' },
        });

        await element(by.id('main-btn-login')).tap();
        await element(by.id('login-email')).replaceText(TEST_USER_EMAIL);
        await element(by.id('login-password')).replaceText(TEST_USER_PASSWORD);
        await element(by.id('login-submit')).tap();

        await waitFor(element(by.id('footer-settings')))
            .toBeVisible()
            .withTimeout(7000);
        let locationAppeared = false;
        const startTime = Date.now();

        while (Date.now() - startTime < 3000) {
            const snapshot = await userDocRef.get();
            const data = snapshot.data() || {};

            if (data.location || data.locationUpdatedAt) {
                locationAppeared = true;
                break;
            }
            await new Promise(r => setTimeout(r, 500));
        }

        jestExpect(locationAppeared).toBe(false);

        const finalSnapshot = await userDocRef.get();
        const finalData = finalSnapshot.data() || {};

        jestExpect(finalData.location).toBeUndefined();
        jestExpect(finalData.locationUpdatedAt).toBeUndefined();
    });

    it('should write location coordinates to Firestore when permission is granted', async () => {
        await device.launchApp({
            newInstance: true,
            permissions: { location: device.getPlatform() === 'ios' ? 'inuse' : 'grant' },
        });

        await element(by.id('main-btn-login')).tap();
        await element(by.id('login-email')).replaceText(TEST_USER_EMAIL);
        await element(by.id('login-password')).replaceText(TEST_USER_PASSWORD);
        await element(by.id('login-submit')).tap();
        await waitFor(element(by.id('footer-settings')))
            .toBeVisible()
            .withTimeout(7000);

        let locationExists = false;
        const startTime = Date.now();

        while (Date.now() - startTime < LOCATION_FIELD_TIMEOUT) {
            const snapshot = await userDocRef.get();
            const data = snapshot.data() || {};

            if (
                data.location &&
                data.location.latitude != null &&
                data.location.longitude != null
            ) {
                locationExists = true;
                jestExpect(typeof data.location.latitude).toBe('number');
                jestExpect(typeof data.location.longitude).toBe('number');
                break;
            }
            await new Promise(r => setTimeout(r, 500));
        }

        jestExpect(locationExists).toBe(true);
    });
});
