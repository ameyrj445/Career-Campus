import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extrasDir = path.resolve(__dirname, '../extras');

const jobColumns = [
    'id',
    'title_and_role',
    'company_name',
    'company_website',
    'location',
    'remote',
    'category',
    'description_responsibilities',
    'requirements_qualifications',
    'education_level',
    'years_experience',
    'experience_requirements',
    'salary_LPA',
    'date_posted',
    'application_url',
    'benefits',
    'tags'
];

const internshipColumns = [
    'ID',
    'TitleAndRole',
    'CompanyName',
    'CompanyWebsite',
    'Location',
    'Remote',
    'Category',
    'Description',
    'Eligibility',
    'Duration',
    'Stipend',
    'DatePosted',
    'ApplicationURL',
    'Perks',
    'Tags'
];

const parseQuotedCsvLine = (line) => {
    const values = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (inQuote) {
            if (ch === "'") {
                if (line[i + 1] === "'") {
                    current += "'";
                    i += 1;
                } else {
                    inQuote = false;
                }
            } else {
                current += ch;
            }
        } else {
            if (ch === "'") {
                inQuote = true;
            } else if (ch === ',') {
                values.push(current);
                current = '';
            } else if (ch === ' ' && current === '') {
                continue;
            } else {
                current += ch;
            }
        }
    }
    if (current !== '' || line.endsWith(',')) {
        values.push(current);
    }

    return values;
};

const loadRows = (filename, columns) => {
    const filePath = path.join(extrasDir, filename);
    const text = fs.readFileSync(filePath, 'utf8');
    const rows = text
        .split(/\r?\n/)
        .filter(line => line.trim().length > 0)
        .map(line => {
            const values = parseQuotedCsvLine(line);
            const row = {};
            columns.forEach((column, index) => {
                row[column] = values[index] ?? '';
            });
            return row;
        });
    return rows;
};

const normalizeTags = (tags) => {
    if (!tags) return [];
    return tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
};

const cleanLocation = (location) => location ? location.replace(/,\s*India$/i, '').trim() : '';

const normalizeJob = (row) => ({
    ...row,
    id: parseInt(row.id, 10) || null,
    years_experience: parseInt(row.years_experience, 10) || null,
    salary_LPA: parseFloat(row.salary_LPA) || null,
    location: cleanLocation(row.location),
    date_posted: row.date_posted || '',
    tags: row.tags || '',
    tagsArray: normalizeTags(row.tags),
});

const normalizeInternship = (row) => ({
    ...row,
    ID: parseInt(row.ID, 10) || null,
    Duration: parseInt(row.Duration, 10) || null,
    Stipend: parseFloat(row.Stipend) || null,
    Location: cleanLocation(row.Location),
    DatePosted: row.DatePosted || '',
    Tags: row.Tags || '',
    tagsArray: normalizeTags(row.Tags),
});

export const jobsData = loadRows('jobs.txt', jobColumns).map(normalizeJob);
export const internshipsData = loadRows('internships.txt', internshipColumns).map(normalizeInternship);

export const uniqueSorted = (items) => Array.from(new Set(items)).filter(Boolean).sort((a, b) => a.toString().localeCompare(b.toString()));

export const normalizeString = (value) => (value || '').toString().trim().toLowerCase();

export const matchText = (value, term) => normalizeString(value).includes(normalizeString(term));

export const isExactly = (value, term) => normalizeString(value) === normalizeString(term);

export const containsTag = (tagArray, tag) => tagArray.some(item => normalizeString(item) === normalizeString(tag));
