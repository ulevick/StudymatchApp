import { calculateAge } from './compatibility';
import { preferencesData } from '../constants/preferencesData';

export default function applyUserFilter(stu, filter, meLoc) {
    if (!filter) return true;

    if (filter.filterGender && stu.gender !== filter.filterGender) return false;

    const age = calculateAge(stu.birthday);
    if (filter.filterAgeMin && age < filter.filterAgeMin) return false;
    if (filter.filterAgeMax && age > filter.filterAgeMax) return false;

    if (
        filter.filterDistanceKm != null &&
        meLoc &&
        stu.distanceKm != null &&
        stu.distanceKm > filter.filterDistanceKm
    ) return false;

    if (filter.filterUniversity && stu.university !== filter.filterUniversity) return false;
    if (filter.filterLevel && stu.studyLevel !== filter.filterLevel) return false;
    if (filter.filterFaculty && stu.faculty !== filter.filterFaculty) return false;
    if (filter.filterStudyProgram && stu.studyProgram !== filter.filterStudyProgram) return false;
    if (filter.filterCourse && stu.course !== filter.filterCourse) return false;

    if (filter.filterPreferences?.length) {
        const sel = filter.filterPreferences;
        const stuPrefs = stu.preferences || {};
        const grouped = preferencesData.reduce((acc, g) => {
            const picks = g.items.filter(i => sel.includes(i));
            if (picks.length) acc[g.title] = picks;
            return acc;
        }, {});
        for (const [cat, need] of Object.entries(grouped)) {
            if (!need.includes(stuPrefs[cat])) return false;
        }
    }

    return true;
}
