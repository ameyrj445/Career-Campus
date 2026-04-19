import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { getJobTags } from './jobQueries.js';
import { getInternshipTags } from './internshipQueries.js';
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
const cleanLocation = (location) => location ? location.replace(/, India$/, '') : '';

// Get distinct categories (combined from both tables)
export async function getCategories() {
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT Category AS category FROM internship_listings
            UNION
            SELECT DISTINCT category FROM job_listings
            ORDER BY category
        `);
        return rows;
    } catch (err) {
        console.error('MySQL error in getCategories:', err);
        throw err;
    }
}

// Get distinct locations (combined from both tables)
export async function getLocations() {
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT Location AS location FROM internship_listings
            UNION
            SELECT DISTINCT location FROM job_listings
            ORDER BY location
        `);
        return rows.map(row => ({
            ...row,
            location: cleanLocation(row.location)
        }));
    } catch (err) {
        console.error('MySQL error in getLocations:', err);
        throw err;
    }
}

// Get distinct companies (combined from both tables)
export async function getCompanies() {
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT CompanyName AS company_name FROM internship_listings
            UNION
            SELECT DISTINCT company_name FROM job_listings
            ORDER BY company_name
        `);
        return rows;
    } catch (err) {
        console.error('MySQL error in getCompanies:', err);
        throw err;
    }
}

// Get all unique tags (combined from both tables)
export async function getTags() {
    try {
        // Get tags from both job and internship listings
        const jobTagsList = await getJobTags();
        const internshipTagsList = await getInternshipTags();
        
        // Combine all unique tags
        const allTags = [...new Set([...jobTagsList, ...internshipTagsList])];
        return allTags.sort();
    } catch (err) {
        console.error('MySQL error in getTags:', err);
        throw err;
    }
}

// Search across both jobs and internships
export async function searchListings(searchTerm) {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                'internship' as type,
                ID as id,
                TitleAndRole as title,
                CompanyName as company,
                Location as location,
                Category as category,
                Stipend as compensation,
                DatePosted as posted_date,
                Tags as tags
            FROM internship_listings
            WHERE 
                TitleAndRole LIKE ? OR
                CompanyName LIKE ? OR
                Category LIKE ? OR
                Tags LIKE ?
            UNION ALL
            SELECT 
                'job' as type,
                id,
                title_and_role as title,
                company_name as company,
                location,
                category,
                salary_LPA as compensation,
                date_posted as posted_date,
                tags
            FROM job_listings
            WHERE 
                title_and_role LIKE ? OR
                company_name LIKE ? OR
                category LIKE ? OR
                tags LIKE ?
            ORDER BY posted_date DESC
        `, Array(8).fill(`%${searchTerm}%`));

        return rows.map(row => ({
            ...row,
            location: cleanLocation(row.location)
        }));
    } catch (err) {
        console.error('MySQL error in searchListings:', err);
        throw err;
    }
} 