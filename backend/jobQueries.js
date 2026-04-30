import { jobsData, uniqueSorted, normalizeString, containsTag } from './dataLoader.js';

const cleanLocation = (location) => location ? location.replace(/,\s*India$/i, '').trim() : '';

const parseList = (value) => value.toString().split(',').map(item => item.trim()).filter(Boolean);

export async function getJobs(filters = {}) {
    const rows = jobsData.filter((job) => {
        if (filters.location) {
            const locations = parseList(filters.location).map(loc => normalizeString(cleanLocation(loc)));
            const jobLocation = normalizeString(job.location);
            if (!locations.some(loc => loc === jobLocation)) {
                return false;
            }
        }

        if (filters.minSalary) {
            const minSalary = parseInt(filters.minSalary, 10);
            if (Number.isFinite(minSalary) && (!Number.isFinite(job.salary_LPA) || job.salary_LPA < minSalary)) {
                return false;
            }
        }

        if (filters.category) {
            const categories = parseList(filters.category);
            if (categories.length > 0 && !categories.some(cat => normalizeString(job.category).includes(normalizeString(cat)))) {
                return false;
            }
        }

        if (filters.company) {
            const companies = parseList(filters.company);
            if (companies.length > 0 && !companies.some(comp => normalizeString(job.company_name).includes(normalizeString(comp)))) {
                return false;
            }
        }

        if (filters.experience) {
            const experience = parseInt(filters.experience, 10);
            if (Number.isFinite(experience) && (!Number.isFinite(job.years_experience) || job.years_experience < experience)) {
                return false;
            }
        }

        if (filters.remote) {
            const remoteValues = parseList(filters.remote).map(value => normalizeString(value));
            if (remoteValues.length > 0 && !remoteValues.includes(normalizeString(job.remote))) {
                return false;
            }
        }

        if (filters.education) {
            const educationValues = parseList(filters.education);
            if (educationValues.length > 0 && !educationValues.some(value => normalizeString(job.education_level).includes(normalizeString(value)))) {
                return false;
            }
        }

        if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
            if (!filters.tags.some(tag => containsTag(job.tagsArray, tag))) {
                return false;
            }
        }

        return true;
    });

    return rows.sort((a, b) => (b.date_posted || '').localeCompare(a.date_posted || ''));
}

export async function getJobFilterOptions() {
    const categories = uniqueSorted(jobsData.map(job => job.category));
    const locations = uniqueSorted(jobsData.map(job => job.location));
    const companies = uniqueSorted(jobsData.map(job => job.company_name));
    const education = uniqueSorted(jobsData.map(job => job.education_level));
    const tags = await getJobTags();

    return {
        categories,
        locations,
        companies,
        education,
        tags
    };
}

export async function getJobById(id) {
    const numericId = Number(id);
    const job = jobsData.find(item => item.id === numericId);
    return job ? { ...job, location: cleanLocation(job.location) } : null;
}

export async function getJobCategories() {
    return uniqueSorted(jobsData.map(job => job.category));
}

export async function getJobLocations() {
    return uniqueSorted(jobsData.map(job => cleanLocation(job.location))).map(location => ({ location }));
}

export async function getJobCompanies() {
    return uniqueSorted(jobsData.map(job => job.company_name));
}

// Get all unique tags for jobs
export async function getJobTags() {
    const allTags = new Set();
    jobsData.forEach(job => job.tagsArray.forEach(tag => allTags.add(tag)));
    return Array.from(allTags).sort();
}
