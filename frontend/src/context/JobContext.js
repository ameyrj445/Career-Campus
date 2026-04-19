import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';

const JobContext = createContext();

export const useJobContext = () => {
    const context = useContext(JobContext);
    if (!context) {
        throw new Error('useJobContext must be used within a JobProvider');
    }
    return context;
};

export const JobProvider = ({ children }) => {
    // State for listings
    const [jobs, setJobs] = useState([]);
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for metadata (filter options)
    const [companies, setCompanies] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);

    // State for active view
    const [activeView, setActiveView] = useState('jobs');

    // Prevent initial fetch loop
    const initialFetchDone = useRef({
        metadata: false,
        jobs: false,
        internships: false
    });

    // Separate filter states for jobs and internships
    const [jobFilters, setJobFilters] = useState({
        locations: [],
        categories: [],
        companies: [],
        remote: [],
        tags: [],
        minSalary: null,
        experience: null,
        education: []
    });

    const [internshipFilters, setInternshipFilters] = useState({
        locations: [],
        categories: [],
        companies: [],
        remote: [],
        tags: [],
        minStipend: null,
        duration: []
    });

    // Load metadata (filter options) on mount
    useEffect(() => {
        if (initialFetchDone.current.metadata) return;

        const fetchMetadata = async () => {
            try {
                const [companiesRes, locationsRes, categoriesRes, tagsRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/companies'),
                    axios.get('http://localhost:5001/api/locations'),
                    axios.get('http://localhost:5001/api/categories'),
                    axios.get('http://localhost:5001/api/tags')
                ]);

                setCompanies(companiesRes.data);
                setLocations(locationsRes.data);
                setCategories(categoriesRes.data);
                setTags(tagsRes.data);
                initialFetchDone.current.metadata = true;
            } catch (err) {
                console.error('Error fetching metadata:', err);
                setError('Failed to load filter options');
            }
        };

        fetchMetadata();
    }, []);

    // Stable function for fetching data to avoid recreating it on each render
    const fetchData = useCallback(async (view, filters) => {
        setLoading(true);
        try {
            const params = {};

            // Add common filters
            if (filters.locations?.length > 0) {
                console.log('Applying location filters:', filters.locations);
                params.location = filters.locations.join(',');
            }
            if (filters.categories?.length > 0) params.category = filters.categories.join(',');
            if (filters.companies?.length > 0) params.company = filters.companies.join(',');
            if (filters.remote?.length > 0) params.remote = filters.remote.join(',');
            if (filters.tags?.length > 0) params.tags = JSON.stringify(filters.tags);

            const endpoint = view === 'jobs' ? 'jobs' : 'internships';

            if (view === 'jobs') {
                // Add job-specific filters
                if (filters.minSalary) params.minSalary = filters.minSalary;
                if (filters.experience) params.experience = filters.experience;
                if (filters.education?.length > 0) params.education = filters.education.join(',');
            } else {
                // Add internship-specific filters
                if (filters.minStipend) params.minStipend = filters.minStipend;
                if (filters.duration?.length > 0) params.duration = filters.duration.join(',');
            }

            console.log(`Fetching ${view} with params:`, params);
            const response = await axios.get(`http://localhost:5001/api/${endpoint}`, { params });

            if (view === 'jobs') {
                setJobs(response.data);
            } else {
                setInternships(response.data);
            }

            setError(null);
        } catch (err) {
            console.error(`Error fetching ${view}:`, err);
            setError(`Failed to fetch ${view}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch jobs data when job filters change
    useEffect(() => {
        if (activeView !== 'jobs') return;

        // Skip first render unless explicitly needed
        if (!initialFetchDone.current.jobs) {
            initialFetchDone.current.jobs = true;
            fetchData('jobs', jobFilters);
            return;
        }

        const timer = setTimeout(() => {
            fetchData('jobs', jobFilters);
        }, 300); // Debounce to avoid multiple rapid API calls

        return () => clearTimeout(timer);
    }, [activeView, jobFilters, fetchData]);

    // Fetch internships data when internship filters change
    useEffect(() => {
        if (activeView !== 'internships') return;

        // Skip first render unless explicitly needed
        if (!initialFetchDone.current.internships) {
            initialFetchDone.current.internships = true;
            fetchData('internships', internshipFilters);
            return;
        }

        const timer = setTimeout(() => {
            fetchData('internships', internshipFilters);
        }, 300); // Debounce to avoid multiple rapid API calls

        return () => clearTimeout(timer);
    }, [activeView, internshipFilters, fetchData]);

    // Update filters based on active view
    const updateFilters = useCallback((filters) => {
        console.log('Updating filters for', activeView, 'with:', filters);
        if (activeView === 'jobs') {
            setJobFilters(prev => {
                const newFilters = {
                    ...prev,
                    locations: filters.locations || [],
                    categories: filters.categories || [],
                    companies: filters.companies || [],
                    remote: filters.remote || [],
                    tags: filters.tags || [],
                    minSalary: filters.minSalary || null,
                    experience: filters.experience || null,
                    education: filters.education || []
                };
                return newFilters;
            });
        } else {
            setInternshipFilters(prev => {
                const newFilters = {
                    ...prev,
                    locations: filters.locations || [],
                    categories: filters.categories || [],
                    companies: filters.companies || [],
                    remote: filters.remote || [],
                    tags: filters.tags || [],
                    minStipend: filters.minStipend || null,
                    duration: filters.duration || []
                };
                return newFilters;
            });
        }
    }, [activeView]);

    // Clear filters for current view
    const clearFilters = useCallback(() => {
        if (activeView === 'jobs') {
            setJobFilters({
                locations: [],
                categories: [],
                companies: [],
                remote: [],
                tags: [],
                minSalary: null,
                experience: null,
                education: []
            });
        } else {
            setInternshipFilters({
                locations: [],
                categories: [],
                companies: [],
                remote: [],
                tags: [],
                minStipend: null,
                duration: []
            });
        }
    }, [activeView]);

    // Switch between jobs and internships view
    const switchView = useCallback((view) => {
        console.log('Switching view to:', view);
        setActiveView(view);

        // Fetch data for the new view if needed
        if (view === 'jobs' && !initialFetchDone.current.jobs) {
            fetchData('jobs', jobFilters);
            initialFetchDone.current.jobs = true;
        } else if (view === 'internships' && !initialFetchDone.current.internships) {
            fetchData('internships', internshipFilters);
            initialFetchDone.current.internships = true;
        }
    }, [fetchData, jobFilters, internshipFilters]);

    // Get current filters based on active view
    const getCurrentFilters = useCallback(() => {
        return activeView === 'jobs' ? jobFilters : internshipFilters;
    }, [activeView, jobFilters, internshipFilters]);

    return (
        <JobContext.Provider value={{
            jobs,
            internships,
            loading,
            error,
            activeView,
            filters: getCurrentFilters(),
            companies,
            locations,
            categories,
            tags,
            updateFilters,
            clearFilters,
            switchView
        }}>
            {children}
        </JobContext.Provider>
    );
};

export default JobContext;