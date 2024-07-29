import axios from 'axios';
import cheerio from 'cheerio';
import { NextResponse } from 'next/server';

interface Job {
    title: string;
    company: string;
    location: string;
    datePosted: string;
    applyUrl: string;
    logoUrl: string;
}

// Function to scrape LinkedIn jobs
const scrapeLinkedInJobs = async (): Promise<Job[]> => {
    try {
        // Fetch the LinkedIn job search page
        const { data } = await axios.get('https://www.linkedin.com/jobs/search/?keywords=front%20end%20developer&location=India');
        const $ = cheerio.load(data);

        const jobs: Job[] = [];

        // Parse the job listings
        $('.base-card').each((_, element) => {
            const title = $(element).find('.base-search-card__title').text().trim();
            const company = $(element).find('.base-search-card__subtitle a').text().trim();
            const location = $(element).find('.job-search-card__location').text().trim();
            const datePosted = $(element).find('.job-search-card__listdate').attr('datetime') || 'N/A';
            const applyUrl = $(element).find('.base-card__full-link').attr('href') || '';
            const logoUrl = $(element).find('.artdeco-entity-image').attr('data-delayed-url') || '';

            if (title && company && location && applyUrl) {
                jobs.push({ title, company, location, datePosted, applyUrl, logoUrl });
            }
        });

        return jobs;
    } catch (error) {
        console.error('Error scraping LinkedIn jobs:', error);
        throw new Error('Failed to scrape LinkedIn jobs');
    }
};

// Named export for GET method
export async function GET() {
    try {
        const jobs = await scrapeLinkedInJobs();
        return NextResponse.json(jobs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to scrape LinkedIn Jobs' }, { status: 500 });
    }
}
