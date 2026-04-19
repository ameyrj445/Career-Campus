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

// Get all internships with filters
export async function getInternships(filters = {}) {
    try {
        const conditions = [];
        const values = [];

        // Base query
        let query = 'SELECT * FROM internship_listings WHERE 1=1';

        // Handle location filter
        if (filters.location) {
            const locations = filters.location.split(',');
            if (locations.length > 0) {
                // Create a simple exact match condition for standardized "city, India" format
                const locationConditions = [];

                for (const loc of locations) {
                    const cleanLoc = loc.trim();
                    // For each location, add an exact match condition
                    locationConditions.push('Location = ?');
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
                console.log('Location filter (internships):', locationConditions, values);
            }
        }

        // Handle stipend filter
        if (filters.minStipend) {
            conditions.push('Stipend >= ?');
            values.push(parseInt(filters.minStipend));
        }

        // Handle category filter
        if (filters.category) {
            const categories = filters.category.split(',');
            if (categories.length > 0) {
                const categoryConditions = categories.map(() => 'Category LIKE ?').join(' OR ');
                conditions.push(`(${categoryConditions})`);
                values.push(...categories.map(cat => `%${cat.trim()}%`));
            }
        }

        // Handle company filter
        if (filters.company) {
            const companies = filters.company.split(',');
            if (companies.length > 0) {
                const companyConditions = companies.map(() => 'CompanyName LIKE ?').join(' OR ');
                conditions.push(`(${companyConditions})`);
                values.push(...companies.map(comp => `%${comp.trim()}%`));
            }
        }

        // Handle duration filter
        if (filters.duration) {
            const durations = filters.duration.split(',');
            if (durations.length > 0) {
                const durationConditions = durations.map(() => 'Duration = ?').join(' OR ');
                conditions.push(`(${durationConditions})`);
                values.push(...durations.map(d => parseInt(d.trim())));
            }
        }

        // Handle remote filter
        if (filters.remote) {
            const remoteOptions = filters.remote.split(',');
            if (remoteOptions.length > 0) {
                const remoteConditions = remoteOptions.map(() => 'Remote = ?').join(' OR ');
                conditions.push(`(${remoteConditions})`);
                values.push(...remoteOptions.map(r => r.trim()));
            }
        }

        // Handle tags filter - using OR between tags for more inclusive matching
        if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
            const tagConditions = [];
            const tagValues = [];

            for (const tag of filters.tags) {
                // Try different patterns to match tags
                // Match at the beginning
                tagConditions.push('Tags LIKE ?');
                tagValues.push(`${tag},%`);

                // Match in the middle
                tagConditions.push('Tags LIKE ?');
                tagValues.push(`%, ${tag},%`);

                // Match at the end
                tagConditions.push('Tags LIKE ?');
                tagValues.push(`%, ${tag}`);

                // Match if it's the only tag
                tagConditions.push('Tags = ?');
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
        query += ' ORDER BY DatePosted DESC';

        console.log('Executing internships query:', query, 'with values:', values);

        const [rows] = await pool.execute(query, values);
        return rows.map(row => ({
            ...row,
            Location: cleanLocation(row.Location)
        }));
    } catch (err) {
        console.error('MySQL error in getInternships:', err);
        throw err;
    }
}

// Get all filter options for internships
export async function getInternshipFilterOptions() {
    try {
        // Get all categories
        const [categories] = await pool.execute('SELECT DISTINCT Category FROM internship_listings ORDER BY Category');

        // Get all locations
        const [locations] = await pool.execute('SELECT DISTINCT Location FROM internship_listings WHERE Location IS NOT NULL AND Location != "" ORDER BY Location');

        // Get all companies
        const [companies] = await pool.execute('SELECT DISTINCT CompanyName FROM internship_listings ORDER BY CompanyName');

        // Get all durations
        const [durations] = await pool.execute('SELECT DISTINCT Duration FROM internship_listings WHERE Duration IS NOT NULL ORDER BY Duration');

        // Get all tags
        const tags = await getInternshipTags();

        return {
            categories: categories.map(row => row.Category),
            locations: locations.map(row => row.Location),
            companies: companies.map(row => row.CompanyName),
            durations: durations.map(row => row.Duration.toString()),
            tags
        };
    } catch (err) {
        console.error('MySQL error in getInternshipFilterOptions:', err);
        throw err;
    }
}

// Get internship by ID
export async function getInternshipById(id) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM internship_listings WHERE ID = ?',
            [id]
        );
        if (rows[0]) {
            rows[0].Location = cleanLocation(rows[0].Location);
        }
        return rows[0];
    } catch (err) {
        console.error('MySQL error in getInternshipById:', err);
        throw err;
    }
}

// Get distinct categories for internships
export async function getInternshipCategories() {
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT Category AS category
            FROM internship_listings
            ORDER BY category
        `);
        return rows;
    } catch (err) {
        console.error('MySQL error in getInternshipCategories:', err);
        throw err;
    }
}

// Get distinct locations for internships
export async function getInternshipLocations() {
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT Location AS location
            FROM internship_listings
            ORDER BY location
        `);
        return rows.map(row => ({
            ...row,
            location: cleanLocation(row.location)
        }));
    } catch (err) {
        console.error('MySQL error in getInternshipLocations:', err);
        throw err;
    }
}

// Get distinct companies for internships
export async function getInternshipCompanies() {
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT CompanyName AS company_name
            FROM internship_listings
            ORDER BY company_name
        `);
        return rows;
    } catch (err) {
        console.error('MySQL error in getInternshipCompanies:', err);
        throw err;
    }
}

// Get all unique tags for internships
export async function getInternshipTags() {
    try {
        const [tags] = await pool.execute('SELECT DISTINCT Tags AS tags FROM internship_listings WHERE Tags IS NOT NULL');

        // Combine and split all tags
        const allTags = new Set();
        tags.forEach(row => {
            if (row.tags) {
                row.tags.split(', ').forEach(tag => allTags.add(tag.trim()));
            }
        });

        return Array.from(allTags).sort();
    } catch (err) {
        console.error('MySQL error in getInternshipTags:', err);
        throw err;
    }
}