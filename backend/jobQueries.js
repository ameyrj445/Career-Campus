import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// MySQL connection configuration
const pool = mysql.createPool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Helper function to clean location names
const cleanLocation = (location) => location ? location.replace(/,\s*India$/i, '').trim() : '';

// Get all jobs with filters
export async function getJobs(filters = {}) {
    try {
        const conditions = [];
        const values = [];

        // Base query
        let query = 'SELECT * FROM job_listings WHERE 1=1';

        // Handle location filter
        if (filters.location) {
            const locations = filters.location.split(',');
            if (locations.length > 0) {
                // Create a simple exact match condition for standardized "city, India" format
                const locationConditions = [];

                for (const loc of locations) {
                    const cleanLoc = loc.trim();
                    // For each location, add an exact match condition
                    locationConditions.push('location = ?');
                    // Add the location with India suffix if not already present
                    if (!/,\s*India$/i.test(cleanLoc)) {
                        values.push(`${cleanLoc}, India`);
                    } else {
                        values.push(cleanLoc);
                    }
                }

                // Join all location conditions with OR
                conditions.push(`(${locationConditions.join(' OR ')})`);

                // Log the query for debugging
                console.log('Location filter:', locationConditions, values);
            }
        }

        // Handle salary filter
        if (filters.minSalary) {
            conditions.push('salary_LPA >= ?');
            values.push(parseInt(filters.minSalary));
        }

        // Handle category filter
        if (filters.category) {
            const categories = filters.category.split(',');
            if (categories.length > 0) {
                const categoryConditions = categories.map(() => 'category LIKE ?').join(' OR ');
                conditions.push(`(${categoryConditions})`);
                values.push(...categories.map(cat => `%${cat.trim()}%`));
            }
        }

        // Handle company filter
        if (filters.company) {
            const companies = filters.company.split(',');
            if (companies.length > 0) {
                const companyConditions = companies.map(() => 'company_name LIKE ?').join(' OR ');
                conditions.push(`(${companyConditions})`);
                values.push(...companies.map(comp => `%${comp.trim()}%`));
            }
        }

        // Handle experience filter
        if (filters.experience) {
            conditions.push('years_experience >= ?');
            values.push(parseInt(filters.experience));
        }

        // Handle remote filter
        if (filters.remote) {
            const remoteOptions = filters.remote.split(',');
            if (remoteOptions.length > 0) {
                const remoteConditions = remoteOptions.map(() => 'remote = ?').join(' OR ');
                conditions.push(`(${remoteConditions})`);
                values.push(...remoteOptions.map(r => r.trim()));
            }
        }

        // Handle education filter
        if (filters.education) {
            const educationLevels = filters.education.split(',');
            if (educationLevels.length > 0) {
                const educationConditions = educationLevels.map(() => 'education_level LIKE ?').join(' OR ');
                conditions.push(`(${educationConditions})`);
                values.push(...educationLevels.map(edu => `%${edu.trim()}%`));
            }
        }

        // Handle tags filter - using OR between tags for more inclusive matching
        if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
            const tagConditions = [];
            const tagValues = [];

            for (const tag of filters.tags) {
                // Try different patterns to match tags
                // Match at the beginning
                tagConditions.push('tags LIKE ?');
                tagValues.push(`${tag},%`);

                // Match in the middle
                tagConditions.push('tags LIKE ?');
                tagValues.push(`%, ${tag},%`);

                // Match at the end
                tagConditions.push('tags LIKE ?');
                tagValues.push(`%, ${tag}`);

                // Match if it's the only tag
                tagConditions.push('tags = ?');
                tagValues.push(tag);
            }

            conditions.push(`(${tagConditions.join(' OR ')})`);
            values.push(...tagValues);
        }

        // Add conditions to query
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        // Add sorting
        query += ' ORDER BY date_posted DESC';

        console.log('Executing jobs query:', query, 'with values:', values);

        const [rows] = await pool.execute(query, values);
        return rows.map(row => ({
            ...row,
            location: cleanLocation(row.location)
        }));
    } catch (err) {
        console.error('MySQL error in getJobs:', err);
        throw err;
    }
}

// Get all filter options for jobs
export async function getJobFilterOptions() {
    try {
        // Get all categories
        const [categories] = await pool.execute('SELECT DISTINCT category FROM job_listings ORDER BY category');

        // Get all locations
        const [locations] = await pool.execute('SELECT DISTINCT location FROM job_listings WHERE location IS NOT NULL AND location != "" ORDER BY location');

        // Get all companies
        const [companies] = await pool.execute('SELECT DISTINCT company_name FROM job_listings ORDER BY company_name');

        // Get all education levels
        const [education] = await pool.execute('SELECT DISTINCT education_level FROM job_listings WHERE education_level IS NOT NULL ORDER BY education_level');

        // Get all tags
        const tags = await getJobTags();

        return {
            categories: categories.map(row => row.category),
            locations: locations.map(row => row.location),
            companies: companies.map(row => row.company_name),
            education: education.map(row => row.education_level),
            tags
        };
    } catch (err) {
        console.error('MySQL error in getJobFilterOptions:', err);
        throw err;
    }
}

// Get job by ID
export async function getJobById(id) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM job_listings WHERE id = ?',
            [id]
        );
        if (rows[0]) {
            rows[0].location = cleanLocation(rows[0].location);
        }
        return rows[0];
    } catch (err) {
        console.error('MySQL error in getJobById:', err);
        throw err;
    }
}

// Get distinct categories for jobs
export async function getJobCategories() {
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT category
            FROM job_listings
            ORDER BY category
        `);
        return rows;
    } catch (err) {
        console.error('MySQL error in getJobCategories:', err);
        throw err;
    }
}

// Get distinct locations for jobs
export async function getJobLocations() {
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT location
            FROM job_listings
            ORDER BY location
        `);
        return rows.map(row => ({
            ...row,
            location: cleanLocation(row.location)
        }));
    } catch (err) {
        console.error('MySQL error in getJobLocations:', err);
        throw err;
    }
}

// Get distinct companies for jobs
export async function getJobCompanies() {
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT company_name
            FROM job_listings
            ORDER BY company_name
        `);
        return rows;
    } catch (err) {
        console.error('MySQL error in getJobCompanies:', err);
        throw err;
    }
}

// Get all unique tags for jobs
export async function getJobTags() {
    try {
        const [tags] = await pool.execute('SELECT DISTINCT tags FROM job_listings WHERE tags IS NOT NULL');

        // Combine and split all tags
        const allTags = new Set();
        tags.forEach(row => {
            if (row.tags) {
                row.tags.split(', ').forEach(tag => allTags.add(tag.trim()));
            }
        });

        return Array.from(allTags).sort();
    } catch (err) {
        console.error('MySQL error in getJobTags:', err);
        throw err;
    }
}