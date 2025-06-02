import { preferencesData } from '../constants/preferencesData';

export const wPref   = 0.40;
export const wDist   = 0.25;
export const wAge    = 0.15;
export const wActive = 0.20;
export const maxKm        = 100;
export const maxAgeDiff   = 10;

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

export const computeScore = (student, me, filter) => {
    const selPrefs = filter?.filterPreferences ?? [];
    const overlap  = selPrefs.filter((p) => {
        const cat = preferencesData.find((g) => g.items.includes(p))?.title;
        return student.preferences?.[cat] === p;
    }).length;
    const prefScore = selPrefs.length ? overlap / selPrefs.length : 0;
    const km   = student.distanceKm ?? maxKm;
    const distScore = 1 - Math.min(km, maxKm) / maxKm;
    const ageStu = calculateAge(student.birthday);
    const ageMe  = calculateAge(me?.birthday);
    const diff   = (ageStu != null && ageMe != null)
        ? Math.abs(ageStu - ageMe)
        : maxAgeDiff;
    const ageScore = 1 - Math.min(diff, maxAgeDiff) / maxAgeDiff;

    const lastActive = student.lastActive?.toDate?.() ?? new Date(0);
    const hours      = (Date.now() - lastActive.getTime()) / 36e5;
    const activeScore = 1 / (1 + hours);

    return (
        wPref   * prefScore  +
        wDist   * distScore  +
        wAge    * ageScore   +
        wActive * activeScore
    );
};
