// =========================== utils/compatibility.js ===========================

/**
 * Suderinamumo (Weighted‑Sum Model) skaičiavimas.
 * Kuo rezultatas arčiau 1, tuo profilis labiau tinka.
 */
import { preferencesData } from '../constants/preferencesData';

// — Konfigūruojami parametrai —
export const wPref   = 0.40;
export const wDist   = 0.25;
export const wAge    = 0.15;
export const wActive = 0.20;
// (kol kas nenaudojame ELO; jei pridėsi – pridėk svorį wElo)

export const maxKm        = 100; // nuotolio normalizavimui
export const maxAgeDiff   = 10;  // metų

/** Amžiaus skaičiavimas iš dd/mm/YYYY formato */
export const calculateAge = (birthday) => {
    if (!birthday) return null;
    const [Y, M, D] = birthday.split("/");
    const birth = new Date(Y, M - 1, D);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

/**
 * Pagrindinė suderinamumo funkcija
 * @param {object} student – kandidato vartotojo duomenys
 * @param {object} me – prisijungusio vartotojo duomenys
 * @param {object} filter – šiuo metu taikomas naudotojo filtras
 * @returns {number} [0–1] balas
 */
export const computeScore = (student, me, filter) => {
    // 1) Preferencijų sankirta
    const selPrefs = filter?.filterPreferences ?? [];
    const overlap  = selPrefs.filter((p) => {
        const cat = preferencesData.find((g) => g.items.includes(p))?.title;
        return student.preferences?.[cat] === p;
    }).length;
    const prefScore = selPrefs.length ? overlap / selPrefs.length : 0;

    // 2) Atstumo kriterijus
    const km   = student.distanceKm ?? maxKm;
    const distScore = 1 - Math.min(km, maxKm) / maxKm;

    // 3) Amžiaus skirtumas
    const ageStu = calculateAge(student.birthday);
    const ageMe  = calculateAge(me?.birthday);
    const diff   = (ageStu != null && ageMe != null)
        ? Math.abs(ageStu - ageMe)
        : maxAgeDiff;
    const ageScore = 1 - Math.min(diff, maxAgeDiff) / maxAgeDiff;

    // 4) Aktyvumas
    const lastActive = student.lastActive?.toDate?.() ?? new Date(0);
    const hours      = (Date.now() - lastActive.getTime()) / 36e5; // valandos
    const activeScore = 1 / (1 + hours); // kuo seniau – tuo mažesnis

    // Galutinis balas (svertų suma)
    return (
        wPref   * prefScore  +
        wDist   * distScore  +
        wAge    * ageScore   +
        wActive * activeScore
    );
};
