const externalLinkOptions = {
    target: '_blank',
    rel: 'noopener noreferrer'
};

function applyExternalLinkOptions(link) {
    Object.assign(link, externalLinkOptions);
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text) {
        element.textContent = text;
    }

    return element;
}

function createExternalLink(href, text) {
    if (!href) {
        return createElement('span', 'item-label', text);
    }

    const link = createElement('a', '', text);
    link.href = href;
    applyExternalLinkOptions(link);

    return link;
}

function createTimelineItem({ title, org, orgLink, date, description }) {
    const item = createElement('li', 'list-item timeline-item');
    const header = createElement('div', 'timeline-header');
    const heading = createElement('span', 'timeline-title');

    heading.append(
        createElement('span', 'timeline-role', title),
        createElement('span', 'timeline-separator', '|'),
        createExternalLink(orgLink, org)
    );
    header.append(heading, createElement('span', 'timeline-date', date));
    item.appendChild(header);

    if (description) {
        item.appendChild(createElement('p', 'timeline-description', description));
    }

    return item;
}

function renderExperience(experience) {
    const list = document.querySelector('.experience-list');
    list.replaceChildren(...experience.map(job => createTimelineItem({
        title: job.role,
        org: job.company,
        orgLink: job.companyLink,
        date: job.date,
        description: job.description
    })));
}

function renderEducation(education) {
    const list = document.querySelector('.education-list');
    list.replaceChildren(...education.map(school => createTimelineItem({
        title: school.degree,
        org: school.school,
        orgLink: school.schoolLink,
        date: school.date,
        description: school.location
    })));
}

function renderArticles(articles) {
    const articleList = document.querySelector('.article-list');
    articleList.innerHTML = '';

    articles.forEach(article => {
        const item = document.createElement('li');
        item.className = 'list-item article-item';

        const link = createExternalLink(article.link, article.title);

        const date = document.createElement('span');
        date.className = 'article-date';
        date.textContent = article.date;

        item.append(link, date);
        articleList.appendChild(item);
    });
}

function createProjectCard(project) {
    const card = createElement('li', 'project-card');
    const tags = createElement('ul', 'project-tags');
    const links = createElement('div', 'project-links');

    project.techstack.split(', ').forEach(tech => {
        tags.appendChild(createElement('li', '', tech));
    });

    Object.entries(project.links || {}).forEach(([label, href]) => {
        const link = createExternalLink(href, label);
        link.setAttribute('aria-label', `${project.name} ${label}`);
        links.appendChild(link);
    });

    card.append(
        createElement('h3', 'project-card-title', project.name),
        createElement('p', 'project-card-description', project.description),
        tags
    );

    if (links.children.length) {
        card.appendChild(links);
    }

    return card;
}

function renderProjects(projects) {
    document.querySelector('.project-cards').replaceChildren(...projects.map(createProjectCard));
}

function renderSkills(skills) {
    const wheel = document.querySelector('.tech-wheel');
    wheel.querySelector('canvas').setAttribute('aria-label', `Tools I use: ${skills.join(', ')}`);
    initTechWheel(wheel, skills);
}

function renderMovies(movies) {
    const movieList = document.querySelector('.movie-list');
    movieList.innerHTML = '';

    movies.forEach(movie => {
        const item = document.createElement('li');
        item.className = 'media-card movie-card';

        const link = document.createElement('a');
        link.href = movie.link;
        applyExternalLinkOptions(link);

        const image = document.createElement('img');
        image.src = movie.poster;
        image.alt = movie.title ? `${movie.title} poster` : 'Movie poster';
        image.className = 'media-poster movie-poster';

        link.appendChild(image);
        item.appendChild(link);
        movieList.appendChild(item);
    });
}

function setupNavToggle() {
    const toggle = document.querySelector('.navbar-toggler');
    const menu = document.querySelector('#navbarNav');

    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });
}

async function loadJson(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Unable to load ${path}`);
    }

    return response.json();
}

async function init() {
    setupNavToggle();

    try {
        const [{ articles, experience, education, projects, skills }, movies] = await Promise.all([
            loadJson('assets/content.json'),
            loadJson('assets/movies.json')
        ]);

        renderExperience(experience);
        renderEducation(education);
        renderProjects(projects);
        renderSkills(skills);
        renderArticles(articles);
        renderMovies(movies);
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

init();
