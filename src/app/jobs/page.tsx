"use client";
import React, { useEffect, useState } from 'react';

interface Job {
    title: string;
    company: string;
    location: string;
    datePosted: string;
    applyUrl: string;
    languages: string[];
}

const fetchJobs = async (page: number): Promise<Job[]> => {
    const res = await fetch(`http://localhost:3000/api/scraper`);
    if (!res.ok) {
        throw new Error('Failed to fetch jobs');
    }
    return res.json();
};

const calculateDaysAgo = (dateString: string) => {
    const today = new Date();
    const datePosted = new Date(dateString);
    const diffInMs = today.getTime() - datePosted.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
};

const HomePage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [filter, setFilter] = useState({
        company: '',
        title: '',
        language: ''
    });
    const [languages, setLanguages] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        const loadJobs = async () => {
            try {
                const jobs = await fetchJobs(currentPage);
                setJobs(jobs);

                // Extract unique languages from jobs
                const allLanguages = jobs.flatMap(job => job.languages || []);
                const uniqueLanguages = Array.from(new Set(allLanguages.filter(lang => typeof lang === 'string')));
                setLanguages(uniqueLanguages);
            } catch (error) {
                console.error('Failed to load jobs:', error);
            }
        };
        loadJobs();
    }, [currentPage]);

    useEffect(() => {
        const applyFilters = () => {
            const { company, title, language } = filter;
            const filtered = jobs.filter(job =>
                (company === '' || job.company.toLowerCase().includes(company.toLowerCase())) &&
                (title === '' || job.title.toLowerCase().includes(title.toLowerCase())) &&
                (language === '' || job.languages.includes(language))
            );
            setFilteredJobs(filtered);
        };
        applyFilters();
    }, [filter, jobs]);

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Job Listings</h1>

            <div className="mb-6 flex gap-4">
                <input
                    type="text"
                    placeholder="Filter by company"
                    value={filter.company}
                    onChange={(e) => setFilter({ ...filter, company: e.target.value })}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    placeholder="Filter by job title"
                    value={filter.title}
                    onChange={(e) => setFilter({ ...filter, title: e.target.value })}
                    className="p-2 border border-gray-300 rounded"
                />
                <select
                    value={filter.language}
                    onChange={(e) => setFilter({ ...filter, language: e.target.value })}
                    className="p-2 border border-gray-300 rounded"
                >
                    <option value="">Filter by language</option>
                    {languages.map((lang, index) => (
                        <option key={index} value={lang}>{lang}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map((job, index) => (
                    <div key={index} className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mb-4 text-blue-500 hover:underline"
                        >
                            <h2 className="text-xl font-bold">{job.title}</h2>
                        </a>
                        <p className="text-gray-600">{job.company}</p>
                        <p className="text-gray-600">{job.location}</p>
                        <p className="text-gray-400">{calculateDaysAgo(job.datePosted)} days ago</p>
                        <p className="text-gray-500 mt-2">
                            {(job.languages || []).join(', ')}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
                <button
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    className="p-2 border border-gray-300 rounded disabled:opacity-50"
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(page => page + 1)}
                    className="p-2 border border-gray-300 rounded disabled:opacity-50"
                    disabled={currentPage >= totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default HomePage;
