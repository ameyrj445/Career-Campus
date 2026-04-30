import { internshipsData, uniqueSorted, normalizeString, containsTag } from './dataLoader.js';

const cleanLocation = (location) => location ? location.replace(/,\s*India$/i, '').trim() : '';

const parseList = (value) => value.toString().split(',').map(item => item.trim()).filter(Boolean);

// Get all internships with filters
export async function getInternships(filters = {}) {
    const rows = internshipsData.filter((internship) => {
        if (filters.location) {
            const locations = parseList(filters.location).map(loc => normalizeString(cleanLocation(loc)));
            const internshipLocation = normalizeString(internship.Location);
            if (!locations.some(loc => loc === internshipLocation)) {
                return false;
            }
        }

        if (filters.minStipend) {
            const minStipend = parseInt(filters.minStipend, 10);
            if (Number.isFinite(minStipend) && (!Number.isFinite(internship.Stipend) || internship.Stipend < minStipend)) {
                return false;
            }
        }

        if (filters.category) {
            const categories = parseList(filters.category);
            if (categories.length > 0 && !categories.some(cat => normalizeString(internship.Category).includes(normalizeString(cat)))) {
                return false;
            }
        }

        if (filters.company) {
            const companies = parseList(filters.company);
            if (companies.length > 0 && !companies.some(comp => normalizeString(internship.CompanyName).includes(normalizeString(comp)))) {
                return false;
            }
        }

        if (filters.duration) {
            const durations = parseList(filters.duration).map(d => parseInt(d, 10));
            if (durations.length > 0 && !durations.some(value => Number.isFinite(value) && internship.Duration === value)) {
                return false;
            }
        }

        if (filters.remote) {
            const remoteValues = parseList(filters.remote).map(value => normalizeString(value));
            if (remoteValues.length > 0 && !remoteValues.includes(normalizeString(internship.Remote))) {
                return false;
            }
        }

        if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
            if (!filters.tags.some(tag => containsTag(internship.tagsArray, tag))) {
                return false;
            }
        }

        return true;
    });

    return rows.sort((a, b) => (b.DatePosted || '').localeCompare(a.DatePosted || ''));
}

export async function getInternshipFilterOptions() {
    const categories = uniqueSorted(internshipsData.map(item => item.Category));
    const locations = uniqueSorted(internshipsData.map(item => item.Location));
    const companies = uniqueSorted(internshipsData.map(item => item.CompanyName));
    const durations = uniqueSorted(internshipsData.map(item => item.Duration).filter(Boolean)).map(value => value.toString());
    const tags = await getInternshipTags();

    return {
        categories,
        locations,
        companies,
        durations,
        tags
    };
}

export async function getInternshipById(id) {
    const numericId = Number(id);
    const internship = internshipsData.find(item => item.ID === numericId);
    return internship ? { ...internship, Location: cleanLocation(internship.Location) } : null;
}

export async function getInternshipCategories() {
    return uniqueSorted(internshipsData.map(item => item.Category));
}

export async function getInternshipLocations() {
    return uniqueSorted(internshipsData.map(item => cleanLocation(item.Location))).map(location => ({ location }));
}

export async function getInternshipCompanies() {
    return uniqueSorted(internshipsData.map(item => item.CompanyName));
}

// Get all unique tags for internships
export async function getInternshipTags() {
    const allTags = new Set();
    internshipsData.forEach(item => item.tagsArray.forEach(tag => allTags.add(tag)));
    return Array.from(allTags).sort();
}