const contactForm = document.querySelector('#contactForm');
const contactStatus = document.querySelector('#contactStatus');
const searchButton = document.querySelector('#searchBtn');
const searchForm = document.querySelector('#siteSearch');
const searchInput = document.querySelector('#siteSearchInput');
const searchStatus = document.querySelector('#siteSearchStatus');

searchButton.addEventListener('click', () => {
    const isOpen = searchButton.getAttribute('aria-expanded') === 'true';
    searchButton.setAttribute('aria-expanded', String(!isOpen));
    searchButton.setAttribute('aria-label', isOpen ? 'Open search' : 'Close search');
    searchForm.hidden = isOpen;

    if (!isOpen) {
        searchInput.focus();
    }
});

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = searchInput.value.trim().toLocaleLowerCase();

    if (!query) {
        searchStatus.textContent = 'Enter a search term.';
        searchInput.focus();
        return;
    }

    const matchingSection = [...document.querySelectorAll('section')]
        .find((section) => section.textContent.toLocaleLowerCase().includes(query));

    if (!matchingSection) {
        searchStatus.textContent = 'No matching content found.';
        return;
    }

    matchingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    searchStatus.textContent = `Found matching content in the ${matchingSection.id || 'page'} section.`;
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        searchForm.hidden = true;
        searchButton.setAttribute('aria-expanded', 'false');
        searchButton.setAttribute('aria-label', 'Open search');
        searchButton.focus();
    }
});

contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contactStatus.textContent = "This demo form isn't connected to a messaging service, so your message hasn't been sent.";
});
