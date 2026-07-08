const externalLinkOptions = {
    target: '_blank',
    rel: 'noopener noreferrer'
};

function applyExternalLinkOptions(link) {
    Object.assign(link, externalLinkOptions);
}

function createExternalLink(href, text) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    applyExternalLinkOptions(link);
    return link;
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

function renderProjects(projects) {
    const projectList = document.querySelector('.project-list');
    projectList.innerHTML = '';

    projects.forEach(project => {
        const item = document.createElement('li');
        item.className = 'list-item project-item';

        const header = document.createElement('div');
        header.className = 'project-header';

        const link = createExternalLink(project.link, project.name);

        const techstack = document.createElement('span');
        techstack.className = 'project-techstack';
        techstack.textContent = project.techstack;

        const description = document.createElement('p');
        description.className = 'project-description';
        description.textContent = project.description;

        header.append(link, techstack);
        item.append(header, description);
        projectList.appendChild(item);
    });
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
        const [{ articles, projects }, movies] = await Promise.all([
            loadJson('assets/content.json'),
            loadJson('assets/movies.json')
        ]);

        renderArticles(articles);
        renderProjects(projects);
        renderMovies(movies);
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

init();
