import { jobsData, internshipsData, uniqueSorted, normalizeString } from './dataLoader.js';
import { getJobTags } from './jobQueries.js';
import { getInternshipTags } from './internshipQueries.js';

const cleanLocation = (location) => location ? location.replace(/, India$/, '').trim() : '';

// Get distinct categories (combined from both tables)
export async function getCategories() {
    return uniqueSorted([
        ...internshipsData.map(item => item.Category),
        ...jobsData.map(item => item.category)
    ]);
}

// Get distinct locations (combined from both tables)
export async function getLocations() {
    return uniqueSorted([
        ...internshipsData.map(item => item.Location),
        ...jobsData.map(item => item.location)
    ]).map(location => ({ location: cleanLocation(location) }));
}

// Get distinct companies (combined from both tables)
export async function getCompanies() {
    return uniqueSorted([
        ...internshipsData.map(item => item.CompanyName),
        ...jobsData.map(item => item.company_name)
    ]);
}

// Get all unique tags (combined from both tables)
export async function getTags() {
    const jobTagsList = await getJobTags();
    const internshipTagsList = await getInternshipTags();
    return uniqueSorted([...jobTagsList, ...internshipTagsList]);
}

// Search across both jobs and internships
export async function searchListings(searchTerm) {
    const normalizedTerm = normalizeString(searchTerm);
    const allRows = [
        ...internshipsData.map(item => ({
            type: 'internship',
            id: item.ID,
            title: item.TitleAndRole,
            company: item.CompanyName,
            location: item.Location,
            category: item.Category,
            compensation: item.Stipend,
            posted_date: item.DatePosted,
            tags: item.Tags
        })),
        ...jobsData.map(item => ({
            type: 'job',
            id: item.id,
            title: item.title_and_role,
            company: item.company_name,
            location: item.location,
            category: item.category,
            compensation: item.salary_LPA,
            posted_date: item.date_posted,
            tags: item.tags
        }))
    ];

    const filteredRows = normalizedTerm
        ? allRows.filter(row =>
            normalizeString(row.title).includes(normalizedTerm) ||
            normalizeString(row.company).includes(normalizedTerm) ||
            normalizeString(row.category).includes(normalizedTerm) ||
            normalizeString(row.tags).includes(normalizedTerm)
        )
        : allRows;

    return filteredRows.sort((a, b) => (b.posted_date || '').localeCompare(a.posted_date || ''));
} 
