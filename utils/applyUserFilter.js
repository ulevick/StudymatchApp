// utils/applyUserFilter.js

import { calculateAge } from './compatibility';
import { preferencesData } from '../constants/preferencesData';

/**
 * Patikrina, ar studentas atitinka visus userData.filter parametrus.
 * @param {object} stu – studento duomenys iš Firestore
 * @param {object} filter – userData.filter
 * @param {object} meLoc – vartotojo lokacija, kad galėtume patikrinti atstumą
 * @returns {boolean}
 */
export default function applyUserFilter(stu, filter, meLoc) {
    if (!filter) return true;

    // Lytis
    if (filter.filterGender && stu.gender !== filter.filterGender) return false;

    // Amžius
    const age = calculateAge(stu.birthday);
    if (filter.filterAgeMin && age < filter.filterAgeMin) return false;
    if (filter.filterAgeMax && age > filter.filterAgeMax) return false;

    // Atstumas
    if (
        filter.filterDistanceKm != null &&
        meLoc &&
        stu.distanceKm != null &&
        stu.distanceKm > filter.filterDistanceKm
    ) return false;

    // Universitetas, lygis, fakultetas, programa, kursas
    if (filter.filterUniversity && stu.university !== filter.filterUniversity) return false;
    if (filter.filterLevel && stu.studyLevel !== filter.filterLevel) return false;
    if (filter.filterFaculty && stu.faculty !== filter.filterFaculty) return false;
    if (filter.filterStudyProgram && stu.studyProgram !== filter.filterStudyProgram) return false;
    if (filter.filterCourse && stu.course !== filter.filterCourse) return false;

    // Pomėgiai
    if (filter.filterPreferences?.length) {
        const sel = filter.filterPreferences;
        const stuPrefs = stu.preferences || {};
        // Sugrupuoja, pagal kokias kategorijas vartotojas pasirinko pomėgius
        const grouped = preferencesData.reduce((acc, g) => {
            const picks = g.items.filter(i => sel.includes(i));
            if (picks.length) acc[g.title] = picks;
            return acc;
        }, {});
        // Patikrina, ar studento pasirinkimas atitinka kiekvieną kategoriją
        for (const [cat, need] of Object.entries(grouped)) {
            if (!need.includes(stuPrefs[cat])) return false;
        }
    }

    return true;
}
