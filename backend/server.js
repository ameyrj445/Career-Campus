import express from 'express';
import cors from 'cors';
import {
    getInternships,
    getInternshipById,
    getInternshipFilterOptions
} from './internshipQueries.js';
import {
    getJobs,
    getJobById,
    getJobFilterOptions
} from './jobQueries.js';
import {
    getCategories,
    getLocations,
    getCompanies,
    getTags,
    searchListings
} from './utilQueries.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
};

// Get all internships with filters
app.get('/api/internships', async (req, res, next) => {
    try {
        console.log('GET /api/internships with filters:', req.query);
        const filters = {
            location: req.query.location,
            minStipend: req.query.minStipend ? parseInt(req.query.minStipend) : null,
            category: req.query.category,
            company: req.query.company,
            duration: req.query.duration,
            remote: req.query.remote,
            tags: req.query.tags ? JSON.parse(req.query.tags) : null
        };
        console.log('Processed filters:', filters);
        const internships = await getInternships(filters);
        console.log(`Found ${internships.length} internships matching filters`);
        res.json(internships);
    } catch (err) {
        next(err);
    }
});

// Get all jobs with filters
app.get('/api/jobs', async (req, res, next) => {
    try {
        console.log('GET /api/jobs with filters:', req.query);
        const filters = {
            location: req.query.location,
            minSalary: req.query.minSalary ? parseInt(req.query.minSalary) : null,
            category: req.query.category,
            company: req.query.company,
            experience: req.query.experience,
            remote: req.query.remote,
            education: req.query.education,
            tags: req.query.tags ? JSON.parse(req.query.tags) : null
        };
        console.log('Processed filters:', filters);
        const jobs = await getJobs(filters);
        console.log(`Found ${jobs.length} jobs matching filters`);
        res.json(jobs);
    } catch (err) {
        next(err);
    }
});

// Get internship by ID
app.get('/api/internships/:id', async (req, res, next) => {
    try {
        const internship = await getInternshipById(parseInt(req.params.id));
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        res.json(internship);
    } catch (err) {
        next(err);
    }
});

// Get job by ID
app.get('/api/jobs/:id', async (req, res, next) => {
    try {
        const job = await getJobById(parseInt(req.params.id));
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (err) {
        next(err);
    }
});

// Get all categories
app.get('/api/categories', async (req, res, next) => {
    try {
        const categories = await getCategories();
        res.json(categories);
    } catch (err) {
        next(err);
    }
});

// Get all locations
app.get('/api/locations', async (req, res, next) => {
    try {
        const locations = await getLocations();
        res.json(locations);
    } catch (err) {
        next(err);
    }
});

// Get all companies
app.get('/api/companies', async (req, res, next) => {
    try {
        const companies = await getCompanies();
        res.json(companies);
    } catch (err) {
        next(err);
    }
});

// Get all tags
app.get('/api/tags', async (req, res, next) => {
    try {
        const tags = await getTags();
        res.json(tags);
    } catch (err) {
        next(err);
    }
});

// Get job filter options
app.get('/api/job-filter-options', async (req, res, next) => {
    try {
        const options = await getJobFilterOptions();
        res.json(options);
    } catch (err) {
        next(err);
    }
});

// Get internship filter options
app.get('/api/internship-filter-options', async (req, res, next) => {
    try {
        const options = await getInternshipFilterOptions();
        res.json(options);
    } catch (err) {
        next(err);
    }
});

// Search across both jobs and internships
app.get('/api/search', async (req, res, next) => {
    try {
        const searchTerm = req.query.q || '';
        const results = await searchListings(searchTerm);
        res.json(results);
    } catch (err) {
        next(err);
    }
});

// Apply error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
