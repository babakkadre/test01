
/**
 * GameCentral.co.uk - Main JavaScript
 * Version: 1.0.0
 */

function parseQueryParams(url) {
    const queryParams = {};
    const queryString = url.split('?')[1];
    if (queryString) {
        const pairs = queryString.split('&');
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            queryParams[key] = decodeURIComponent(value);
        }
    }
    return queryParams;
}

function setCookie(name, value, hours) {
    const expires = new Date();
    //expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    expires.setTime(expires.getTime() + hours * 3600 * 1000); //hours
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) {
            return cookieValue;
        }
    }
    return null;
}

function handleQueryParams() {
    const queryParams = parseQueryParams(window.location.href);
    for (const key in queryParams) {
        setCookie(key, queryParams[key], 1); // Store for 30 days, adjust as needed
    }
}

handleQueryParams();

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selections ---
    const loader = document.getElementById('loader-container');
    const loaderText = document.getElementById('loader-text');
    const mainContent = document.getElementById('main-content');
    const pageContents = document.querySelectorAll('.page-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuIcon = mobileMenuButton?.querySelector('.lucide');
    const tableBody = document.getElementById('game-list-container');
    const filterPayment = document.getElementById('filter-payment');
    const filterFeature = document.getElementById('filter-feature');
    const sortRatingBtn = document.getElementById('sort-rating');
    const sortBonusBtn = document.getElementById('sort-bonus');
    const sortNameBtn = document.getElementById('sort-name');
    const quickFilterButtons = document.querySelectorAll('#sticky-nav .filter-button');
    const bonusAmountInput = document.getElementById('bonus-amount');
    const depositAmountInput = document.getElementById('deposit-amount');
    const wageringReqInput = document.getElementById('wagering-requirement');
    const wageringAppliesToSelect = document.getElementById('wagering-applies-to');
    const gameContributionInput = document.getElementById('game-contribution');
    const calculateBtn = document.getElementById('calculate-wagering-btn');
    const wageringResultDiv = document.getElementById('wagering-result')?.querySelector('strong');
    const cookieBanner = document.getElementById('cookie-consent-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    const cookieSettingsLink = document.getElementById('cookie-settings-link');
    const cookieSettingsBtn = document.getElementById('cookie-settings-button');
    const exitIntentPopup = document.getElementById('exit-intent-popup');
    const exitIntentCloseButtons = exitIntentPopup?.querySelectorAll('.modal-close');
    const exitIntentOfferDiv = document.getElementById('exit-intent-offer');
    const exitIntentLink = document.getElementById('exit-intent-link');
    const stickyBanner = document.getElementById('sticky-offer-banner');
    const stickyOfferSite = document.getElementById('sticky-offer-site');
    const stickyOfferLink = document.getElementById('sticky-offer-link');


    // --- State Variables ---
    const defaultPage = 'home';
    let currentSort = { column: 'rank', direction: 'asc' };
    let currentFilters = { payment: 'all', feature: 'all', quick: 'all' };
    let mouseLeftWindow = false;
    const COOKIE_CONSENT_KEY = 'gamecentral_cookie_consent';
    
    // --- Page Navigation ---
    function showPage(pageId) {
        // First, load content for the page if it exists in our data
        loadPageContent(pageId);
        
        pageContents.forEach(page => {
            if (page.dataset.pageId === pageId) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });

        // Update active state for nav links
        navLinks.forEach(link => {
            if (link.dataset.page === pageId) {
                link.classList.add('active', 'bg-brand-primary', 'text-white');
                link.classList.remove('hover:bg-brand-primary/70');
            } else {
                link.classList.remove('active', 'bg-brand-primary', 'text-white');
                link.classList.add('hover:bg-brand-primary/70');
            }
        });

        // Scroll to top of page content if navigating to a new page (not just hash change)
        if(window.location.hash !== `#${pageId}`) {
            // Find the top position of the main content area
            const mainContentTop = mainContent.getBoundingClientRect().top + window.pageYOffset;
            // Calculate offset, considering sticky header height
            const offsetPosition = mainContentTop - 60;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }

        // Close mobile menu if open
        if(mobileMenu) mobileMenu.classList.add('hidden');
        if(mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');
        const svgIconHamburger = '<svg\n' +
            '  xmlns="http://www.w3.org/2000/svg"\n' +
            '  width="35"\n' +
            '  height="35"\n' +
            '  viewBox="0 0 24 24"\n' +
            '  fill="none"\n' +
            '  stroke="currentColor"\n' +
            '  stroke-width="2"\n' +
            '  stroke-linecap="round"\n' +
            '  stroke-linejoin="round"\n' +
            '>\n' +
            '  <line x1="3" y1="6" x2="21" y2="6" />\n' +
            '  <line x1="3" y1="12" x2="21" y2="12" />\n' +
            '  <line x1="3" y1="18" x2="21" y2="18" />\n' +
            '</svg>';
        if(mobileMenuIcon) mobileMenuIcon.innerHTML = svgIconHamburger; // Reset icon

        // Update URL hash using replaceState to avoid cluttering history
        history.replaceState(null, '', `#${pageId}`);
    }

    function handleNavigation() {
        // Show initial page based on hash or default
        const initialPageId = window.location.hash.substring(1) || defaultPage;
        const validPageIds = Array.from(pageContents).map(p => p.dataset.pageId);

        if (validPageIds.includes(initialPageId)) {
            showPage(initialPageId);
        } else {
            showPage(defaultPage); // Fallback to home
        }

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const pageId = link.dataset.page;
                if (pageId) {
                    e.preventDefault(); // Prevent default anchor jump
                    showPage(pageId);
                }
                // Allow external links or non-page links to work normally
            });
        });

        // Handle back/forward button navigation
        window.addEventListener('popstate', () => {
            const pageId = window.location.hash.substring(1) || defaultPage;
            const validPageIds = Array.from(pageContents).map(p => p.dataset.pageId);
            if (validPageIds.includes(pageId)) {
                showPage(pageId);
            } else {
                showPage(defaultPage);
            }
        });
    }

    // --- Mobile Menu Toggle ---
    if(mobileMenuButton && mobileMenu && mobileMenuIcon) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            const closeIconMobile = '<svg\n' +
                '  xmlns="http://www.w3.org/2000/svg"\n' +
                '  width="35"\n' +
                '  height="35"\n' +
                '  viewBox="0 0 24 24"\n' +
                '  fill="none"\n' +
                '  stroke="currentColor"\n' +
                '  stroke-width="2"\n' +
                '  stroke-linecap="round"\n' +
                '  stroke-linejoin="round"\n' +
                '>\n' +
                '  <line x1="18" y1="6" x2="6" y2="18" />\n' +
                '  <line x1="6" y1="6" x2="18" y2="18" />\n' +
                '</svg>';
            const svgIconHamburger = '<svg\n' +
                '  xmlns="http://www.w3.org/2000/svg"\n' +
                '  width="35"\n' +
                '  height="35"\n' +
                '  viewBox="0 0 24 24"\n' +
                '  fill="none"\n' +
                '  stroke="currentColor"\n' +
                '  stroke-width="2"\n' +
                '  stroke-linecap="round"\n' +
                '  stroke-linejoin="round"\n' +
                '>\n' +
                '  <line x1="3" y1="6" x2="21" y2="6" />\n' +
                '  <line x1="3" y1="12" x2="21" y2="12" />\n' +
                '  <line x1="3" y1="18" x2="21" y2="18" />\n' +
                '</svg>';
            mobileMenuIcon.innerHTML = isExpanded ? svgIconHamburger : closeIconMobile; // Toggle icon
        });
    }

    // --- Loader Animation ---
    const loaderMessages = [
        "Loading GameCentral...",
        "Comparing top gaming sites...",
        "Fetching latest bonuses...",
        "Checking reviews...",
        "Almost there..."
    ];
    let messageIndex = 0;
    let loaderInterval;

    function startLoaderAnimation() {
        if (!loaderText) return; // Exit if loader text element not found
        loaderInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loaderMessages.length;
            loaderText.textContent = loaderMessages[messageIndex];
        }, 1500); // Change message every 1.5 seconds
    }

    function hideLoader() {
        if (!loader) return; // Exit if loader element not found
        clearInterval(loaderInterval); // Stop changing messages
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500); // Match CSS transition duration
    }

    // --- Load Page Content from JSON ---
    function loadPageContent(pageId) {
        if (!window.siteData || !window.siteData.pages) return;
        
        const page = window.siteData.pages.find(p => p.id === pageId);
        if (!page) return;
        
        const pageElement = document.getElementById(`${pageId}-content`);
        if (!pageElement) return;
        
        // Only load content if it hasn't been loaded yet
        if (!pageElement.dataset.loaded) {
            pageElement.innerHTML = page.content;
            pageElement.dataset.loaded = 'true';
            
            // Re-attach event listeners if needed
            if (pageId === 'bonus-calculator') {
                initBonusCalculator();
            } else if (pageId === 'faq') {
                initFaqAccordions();
            }
        }
    }

    // --- Update Date References ---
    function updateDateReferences() {
        const currentDate = new Date();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                        'August', 'September', 'October', 'November', 'December'];
        const currentMonth = months[currentDate.getMonth()];
        const currentYear = currentDate.getFullYear();
        
        // Update all date references
        document.querySelectorAll('[data-dynamic-date]').forEach(el => {
            el.textContent = el.textContent.replace(/April 2025/g, `${currentMonth} ${currentYear}`);
        });
        
        // Update copyright year
        const yearElements = document.querySelectorAll('.current-year');
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    }

    /*
    function updateLinksFromAhref() {
        const currentParams = new URLSearchParams(window.location.search);
        if ([...currentParams].length === 0) return;

        document.querySelectorAll('a').forEach(link => {
            let href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

            href = href.replace(/\{(\w+)\}/g, (match, key) => {
                return getCookie(key) || (currentParams.get(key) || match);
            });

            const separator = href.includes('?') ? '&' : '?';
            const paramString = currentParams.toString();
            const updatedHref = href + separator + paramString;

            setTimeout(() => {
                link.setAttribute('href', updatedHref);
            }, 500);
        });
    }
    */

    function replacePlaceholders(linkVisit){
        /*
        const urlParams = new URLSearchParams(window.location.search);
        const paramMap = {};
        for (const [key, value] of urlParams.entries()) {
            paramMap[key] = value;
        }

        return linkVisit.replace(/{(\w+)}/g, (match, p1) => {
            const val = getCookie(p1);
            return val !== null ? val : match;
        });
        */

        const currentParams = window.location.search.slice(1);
        let separator = '';
        if( linkVisit ){
            separator = linkVisit.includes('?') ? '&' : '?';
        }
        let updatedHrefVisit = linkVisit + separator + currentParams;
        return updatedHrefVisit.replace(/\{(\w+)\}/g, (match, key) => {
            return (new URLSearchParams(window.location.search)).get(key) || match;
        });

        /*
        return linkVisit.replace(/{(\w+)}/g, (match, p1) => {
            return paramMap[p1] !== undefined ? paramMap[p1] : match;
        });
        */

    }

    // --- Table Generation, Filtering, Sorting ---
    function renderTable(data) {
        if (!tableBody) return; // Exit if table body not found
        tableBody.innerHTML = ''; // Clear existing rows
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-text-medium">No gaming sites match your current filters.</td></tr>';
            return;
        }
        
        data.forEach(site => {
            const row = document.createElement('tr');
            const rowMobile = document.createElement('tr');
            row.className = 'game-row bg-bg-dark hover:bg-bg-medium/50 transition duration-150 !hidden md:!table-row w-full';
            rowMobile.className = 'game-row bg-bg-dark hover:bg-bg-medium/50 transition duration-150 !block md:!hidden';
            row.dataset.siteId = site.id;
            rowMobile.dataset.siteId = site.id;

            let linkVisit = replacePlaceholders(site.siteUrl);
            //const currentParams = window.location.search.slice(1);
            //const separator = linkVisit.includes('?') ? '&' : '?';
            //let updatedHrefVisit = linkVisit + separator + currentParams;

            //updatedHrefVisit = updatedHrefVisit.replace(/\{(\w+)\}/g, (match, key) => {
            //    return (new URLSearchParams(window.location.search)).get(key) || match;
            //});



            // NOTE: data-label attributes added for mobile view CSS targeting
            const desktopRow = `
                <td data-label="Rank" class="p-3 text-center font-semibold text-lg !align-middle">${site.rank}</td>
                <td data-label="Gaming Site" class="p-3  !align-middle" data-rating="${site.rating.toFixed(1)}" data-rank="${site.rank}">
                    <div class="flex items-center justify-center md:justify-start space-x-3"> <img data-src="${site.logo}" alt="${site.name} Logo" class="h-10 w-10 rounded lazyload shrink-0" width="40" height="40" src="https://placehold.co/40x40/1a1a2e/1a1a2e?text=">
                        <div>
                            <div class="font-semibold text-base text-text-light text-center md:text-left">${site.name}</div> <div class="text-xs text-text-dark text-center md:text-left">${site.licensed ? 'UKGC Licenced' : ''}</div> </div>
                    </div>
                </td>
                <td data-label="Welcome Bonus" class="p-3 bonus-cell  !align-middle">
                    <div class="welcome-bonus-label text-xs text-gray-400 uppercase mb-1 hidden md:block">Welcome Bonus</div>
                    <div class="text-3xl">${site.bonusHeadline}</div>
                    <div class="text-lg">${site.bonusSubtext}</div>
                    <div class="significant-terms">
                        <strong>Significant Terms:</strong> ${site.terms}
                    </div>
                    <span class="terms-link text-xs">Show T&Cs</span>
                </td>
                <td data-label="Rating" class="p-3 text-center !align-middle">
                    <div class="text-lg font-bold text-brand-secondary">${site.rating.toFixed(1)} <span class="text-sm text-text-medium">/ 5</span></div>
                    <div class="text-xs text-text-dark mt-1">${site.ratingText}</div>
                </td>
                <td data-label="Actions" class="p-3 !align-middle">
                    <div class="flex flex-row gap-2 justify-center"> <a href="${linkVisit}" target="_blank" rel="noopener noreferrer sponsored" class="block w-full md:w-auto text-center bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-opacity-80 transition duration-200">Visit Site</a>
                        <button class="quick-view-button block w-full md:w-auto text-center bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-500 transition duration-200" data-site-id="${site.id}">Quick View</button>
                    </div>
                </td>
            `;
            const mobileRow = `
                <td colspan="5" data-label="Rank" class="p-3 text-center font-semibold text-lg relative overflow-hidden w-full block">
                
                <div data-label="Rank" class="absolute z-[5] -top-0.5  -left-0.5 p-1 text-center bg-black/80 rounded-md h-8 w-8 font-semibold text-lg td-rank">${site.rank}</div>
                
                <div class="flex w-full mb-3">
                    <div class="w-[40%]">
                        <div data-label="Gaming Site" class="p-0" data-rating="${site.rating.toFixed(1)}" data-rank="${site.rank}">
                            <div class="flex flex-col items-center justify-center md:justify-start space-x-3">
                            <img data-src="${site.logo}" alt="${site.name} Logo" class="h-10 w-10 rounded lazyload shrink-0" width="40" height="40" src="https://placehold.co/40x40/1a1a2e/1a1a2e?text=">
                            <div>
                                <div class="font-semibold text-base text-text-light text-center md:text-left">${site.name}</div>
                                <div class="text-xs text-text-dark text-center md:text-left">${site.licensed ? 'UKGC Licenced' : ''}</div>
                            </div>
                            </div>
                        </div>
                        <div data-label="Rating" class="p-3 text-center">
                            <div class="text-lg font-bold text-brand-secondary">${site.rating.toFixed(1)} <span class="text-sm text-text-medium">/ 5</span></div>
                            <div class="text-xs text-text-dark mt-1">${site.ratingText}</div>
                        </div>
                    </div>
                    
                    <div class="w-[60%] text-center bg-gray-800 flex flex-col justify-center">
                        <div data-label="Welcome Bonus" class="p-3 !text-center bonus-cell"> <div class="welcome-bonus-label text-xs text-gray-400 uppercase mb-1 hidden md:block">Welcome Bonus</div>
                            <div class="!text-xl">${site.bonusHeadline}</div>
                            <div class="!text-lg text-yellow-600">${site.bonusSubtext}</div>
                            <div class="significant-terms">
                                <strong>Significant Terms:</strong> ${site.terms}
                            </div>
                            <span class="terms-link text-xs">Show T&Cs</span>
                        </div> 
                    </div>
                </div>
                
                <div data-label="Actions" class="w-full flex">
                    <div class="flex flex-row w-full justify-center gap-3">
                        <a href="${linkVisit}" target="_blank" rel="noopener noreferrer sponsored" class="block w-full text-center bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-opacity-80 transition duration-200">Visit Site</a>
                        <button class="quick-view-button block w-full text-center bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-500 transition duration-200" data-site-id="${site.id}">Quick View</button>
                    </div>
                </div>
            `;
            row.innerHTML = desktopRow;
            rowMobile.innerHTML = mobileRow;
            tableBody.appendChild(row);
            tableBody.appendChild(rowMobile);
        });
        
        setupTableInteractions(); // Re-attach listeners for terms toggle, quick view etc.
        lazyLoadImages(); // Trigger lazy loading for new images
    }

    function filterAndSortData() {
        if (!window.siteData || !window.siteData.gameSites) return;
        
        let filteredData = [...window.siteData.gameSites];

        // Apply quick filters
        if (currentFilters.quick !== 'all') {
            filteredData = filteredData.filter(site => {
                if (currentFilters.quick === 'new') return site.isNew;
                if (currentFilters.quick === 'free_spins') return site.hasFreeSpins;
                if (currentFilters.quick === 'low_wager') return site.lowWager;
                return true;
            });
        }

        // Apply dropdown filters
        if (currentFilters.payment !== 'all') {
            filteredData = filteredData.filter(site => site.payments.includes(currentFilters.payment));
        }
        
        if (currentFilters.feature !== 'all') {
            filteredData = filteredData.filter(site => site.features.includes(currentFilters.feature));
        }

        // Apply sorting
        filteredData.sort((a, b) => {
            let valA, valB;
            switch (currentSort.column) {
                case 'rating':
                    valA = a.rating;
                    valB = b.rating;
                    break;
                case 'bonus': 
                    // Use bonusValue if available, otherwise fall back to rank
                    valA = a.bonusValue || a.rank;
                    valB = b.bonusValue || b.rank;
                    break;
                case 'name':
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                    break;
                default: // rank
                    valA = a.rank;
                    valB = b.rank;
            }

            // Apply direction
            if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;

            // Secondary sort by rank if primary values are equal
            if (currentSort.column !== 'rank') {
                return a.rank - b.rank;
            }
            return 0;
        });

        renderTable(filteredData);
        //updateLinksFromAhref();
        updateSortIndicators();
    }

    function updateSortIndicators() {
        document.querySelectorAll('.sort-button').forEach(btn => {
            const indicator = btn.querySelector('.sort-indicator');
            if (!indicator) return; // Skip if indicator not found
            
            indicator.classList.remove('active');
            // Use HTML entities instead of Lucide class names
            indicator.innerHTML = '&#8597;'; // bidirectional arrow HTML entity
            
            if (btn.dataset.sort === currentSort.column) {
                indicator.classList.add('active');
                indicator.innerHTML = currentSort.direction === 'asc' ? '&#8593;' : '&#8595;'; // Up or down arrow
            }
        });
    }

    // --- Event Listeners for Filters and Sort ---
    function setupFiltersAndSort() {
        if (filterPayment) {
            filterPayment.addEventListener('change', (e) => {
                currentFilters.payment = e.target.value;
                filterAndSortData();
            });
        }
        
        if (filterFeature) {
            filterFeature.addEventListener('change', (e) => {
                currentFilters.feature = e.target.value;
                filterAndSortData();
            });
        }

        quickFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                quickFilterButtons.forEach(btn => btn.classList.remove('active', 'bg-brand-primary'));
                button.classList.add('active', 'bg-brand-primary');
                currentFilters.quick = button.dataset.filter;
                filterAndSortData();
            });
        });

        [sortRatingBtn, sortBonusBtn, sortNameBtn].forEach(button => {
            if (button) { // Check if button exists
                button.addEventListener('click', () => {
                    const sortColumn = button.dataset.sort;
                    if (currentSort.column === sortColumn) {
                        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                    } else {
                        currentSort.column = sortColumn;
                        // Default sort directions
                        currentSort.direction = (sortColumn === 'rating' || sortColumn === 'bonus') ? 'desc' : 'asc';
                    }
                    filterAndSortData();
                });
            }
        });
    }

    // --- Table Interactions ---
    function setupTableInteractions() {
        if (!tableBody) return; // Exit if table body not found
        
        // Terms Toggle - Use event delegation on the table body
        tableBody.addEventListener('click', function(e) {
            // Target the terms link specifically
            if (e.target.classList.contains('terms-link')) {
                // Find the closest ancestor bonus cell
                const bonusCell = e.target.closest('.bonus-cell');
                if (bonusCell) {
                    // Find the terms div within that cell
                    const termsDiv = bonusCell.querySelector('.significant-terms');
                    if (termsDiv) {
                        const isActive = termsDiv.classList.toggle('active'); // Toggle the class
                        e.target.textContent = isActive ? 'HideT&Cs' : 'Show T&Cs';
                    }
                }
            }

            // Target the quick view button specifically
            if (e.target.classList.contains('quick-view-button')) {
                const siteId = e.target.dataset.siteId;
                if (!window.siteData || !window.siteData.gameSites) return;
                
                const site = window.siteData.gameSites.find(s => s.id === siteId);
                const quickViewModal = document.getElementById('quick-view-modal');
                const quickViewContent = document.getElementById('quick-view-content');

                let linkVisit =  replacePlaceholders(site.siteUrl);
                /*
                const currentParams = window.location.search.slice(1);
                const separator = linkVisit.includes('?') ? '&' : '?';
                let updatedHrefVisit = linkVisit + separator + currentParams;
                updatedHrefVisit = updatedHrefVisit.replace(/\{(\w+)\}/g, (match, key) => {
                    return (new URLSearchParams(window.location.search)).get(key) || match;
                });
                */

                if (site && quickViewModal && quickViewContent) {
                    // Enhanced Quick View Modal content
                    quickViewContent.innerHTML = `
                        <div class="text-center mb-5">
                            <img src="${site.logo}" alt="${site.name} Logo" class="h-20 w-20 rounded mx-auto mb-3">
                            <h4 class="text-xl font-semibold">${site.name}</h4>
                            <div class="flex justify-center items-center mt-1">
                                <span class="text-brand-secondary text-xl font-bold mr-2">${site.rating}</span>
                                <div class="flex">
                                    ${generateStarRating(site.rating)}
                                </div>
                                <span class="ml-2 text-sm text-text-medium">/ 5 - ${site.ratingText}</span>
                            </div>
                            ${site.licensed ? '<div class="mt-1 text-sm text-green-400">UKGC Licensed <span class="icon-circle-check-big"></span></div>' : ''}
                        </div>
                        
                        <div class="bg-bg-dark p-4 rounded-lg mb-4 text-center">
                            <h5 class="uppercase text-xs text-text-dark tracking-wider mb-2">Welcome Bonus</h5>
                            <p class="text-xl font-bold text-text-light mb-1">${site.bonusHeadline}</p>
                            <p class="text-text-medium">${site.bonusSubtext}</p>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <h6 class="uppercase text-xs text-text-dark tracking-wider mb-2">Payment Methods</h6>
                                <div class="flex flex-wrap gap-1">
                                    ${generatePaymentMethods(site.payments)}
                                </div>
                            </div>
                            <div>
                                <h6 class="uppercase text-xs text-text-dark tracking-wider mb-2">Features</h6>
                                <div class="flex flex-wrap gap-1">
                                    ${generateFeatureBadges(site.features)}
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <h6 class="uppercase text-xs text-text-dark tracking-wider mb-2">Significant Terms:</h6>
                            <div class="terms-snippet text-xs p-3 bg-bg-dark rounded border border-white/10 max-h-32 overflow-y-auto scrollbar-thin">${site.terms}</div>
                        </div>
                        
                        <a href="${linkVisit}" target="_blank" rel="noopener noreferrer sponsored" class="mt-4 block w-full text-center bg-brand-primary text-white px-4 py-3 rounded-md font-semibold hover:bg-opacity-80 transition duration-200">Claim Bonus Now</a>
                        <p class="text-xs text-center text-text-dark mt-2">18+ T&Cs Apply. BeGambleAware.org</p>
                    `;
                    
                    quickViewModal.classList.remove('hidden');
                    document.body.style.overflow = 'hidden'; // Prevent background scroll
                }
            }
        });

        // Helper functions for generating components in the quick view
        function generateStarRating(rating) {
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(rating)) {
                    stars += '<span class="text-brand-secondary icon-star"></span>'; // Full star
                } else if (i - 0.5 <= rating) {
                    stars += '<span class="text-brand-secondary icon-star-half"></span>'; // Half star (simplified)
                } else {
                    stars += '<span class="text-gray-600 icon-star-off"></span>'; // Empty star
                }
            }
            return stars;
        }
        
        function generatePaymentMethods(payments) {
            if (!payments || !payments.length) return 'Information not available';
            
            const paymentIcons = {
                'paypal': '<span class="icon-credit-card text-base text-yellow-400"></span> PayPal',
                'skrill': '<span class="icon-credit-card text-base text-yellow-400"></span> Skrill',
                'paysafecard': '<span class="icon-credit-card text-base text-yellow-400"></span> Paysafecard',
                'trustly': '<span class="icon-credit-card text-base text-yellow-400"></span> Trustly',
                'visa': '<span class="icon-credit-card text-base text-yellow-400"></span> Visa',
                'mastercard': '<span class="icon-credit-card text-base text-yellow-400"></span> Mastercard',
                'ethereum': '<span class="icon-credit-card text-base text-yellow-400"></span> Ethereum',
                'litecoin': '<span class="icon-credit-card text-base text-yellow-400"></span> Litecoin',
                'ripple': '<span class="icon-credit-card text-base text-yellow-400"></span> Ripple',
                'neteller': '<span class="icon-credit-card text-base text-yellow-400"></span> Neteller',
                'bank_transfer': '<span class="icon-landmark text-base text-yellow-400"></span> Bank Transfer',
                'bank': '<span class="icon-landmark text-base text-yellow-400"></span> Bank Transfer'
            };
            
            return payments.map(p => 
                `<span class="flex flex-row justify-center items-center gap-1 pr-2 leading-normal py-0 text-sm">${paymentIcons[p] || p}</span>`
            ).join('');
        }
        
        function generateFeatureBadges(features) {
            if (!features || !features.length) return 'Information not available';
            
            const featureLabels = {
                'live_dealer': '<span class="icon-radio text-base text-yellow-400"></span> Live Dealer',
                'mobile_app': '<span class="icon-smartphone text-base text-yellow-400"></span> Mobile App',
                'mobile_friendly': '<span class="icon-smartphone text-base text-yellow-400"></span> Mobile Friendly',
                'sportsbook': '<span class="icon-volleyball text-base text-yellow-400"></span> Sportsbook',
                'tournaments': '<span class="icon-trophy text-base text-yellow-400"></span> Tournaments',
                'reload_bonuses': '<span class="icon-gift text-base text-yellow-400"></span> Reload Bonuses',
                'vip': '<span class="icon-award text-base text-yellow-400"></span> VIP Program',
                'vip_program': '<span class="icon-award text-base text-yellow-400"></span> VIP Program',
                'crypto_payments': '<span class="icon-wallet text-base text-yellow-400"></span> Crypto Payments',
                'fast_withdrawals': '<span class="icon-wallet text-base text-yellow-400"></span> Fast Withdrawals',
                'cashback_offers': '<span class="icon-wallet text-base text-yellow-400"></span> Cashback Offers',
                'no_deposit_offers': '<span class="icon-gift text-base text-yellow-400"></span> No Deposit Offers'
            };
            
            return features.map(f => 
                `<span class="flex flex-row justify-center items-center gap-1 pr-2 leading-normal py-0 text-sm">${featureLabels[f] || f}</span>`
            ).join('');
        }

        // Quick View Modal Close Logic
        const quickViewModal = document.getElementById('quick-view-modal');
        if (quickViewModal) {
            const quickViewCloseButtons = quickViewModal.querySelectorAll('.modal-close');
            quickViewCloseButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    quickViewModal.classList.add('hidden');
                    document.body.style.overflow = ''; // Restore scroll
                });
            });
            
            // Close modal on background click
            quickViewModal.addEventListener('click', (e) => {
                if (e.target === quickViewModal) {
                    quickViewModal.classList.add('hidden');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    // --- Bonus Calculator ---
    function initBonusCalculator() {
        const bonusAmountInput = document.getElementById('bonus-amount');
        const depositAmountInput = document.getElementById('deposit-amount');
        const wageringReqInput = document.getElementById('wagering-requirement');
        const wageringAppliesToSelect = document.getElementById('wagering-applies-to');
        const gameContributionInput = document.getElementById('game-contribution');
        const calculateBtn = document.getElementById('calculate-wagering-btn');
        const wageringResultDiv = document.getElementById('wagering-result')?.querySelector('strong');

        if (calculateBtn) {
            calculateBtn.addEventListener('click', calculateWagering);
            
            // Add listeners to inputs for real-time calculation
            [bonusAmountInput, depositAmountInput, wageringReqInput, wageringAppliesToSelect, gameContributionInput].forEach(el => {
                if(el) el.addEventListener('input', calculateWagering);
            });
            
            // Initial calculation
            calculateWagering();
        }
    }

    function calculateWagering() {
        // Ensure elements exist before accessing value property
        const bonus = parseFloat(document.getElementById('bonus-amount')?.value) || 0;
        const deposit = parseFloat(document.getElementById('deposit-amount')?.value) || 0;
        const req = parseFloat(document.getElementById('wagering-requirement')?.value) || 0;
        const appliesTo = document.getElementById('wagering-applies-to')?.value;
        const contribution = (parseFloat(document.getElementById('game-contribution')?.value) || 100) / 100;
        const resultElement = document.getElementById('wagering-result')?.querySelector('strong');

        if (req <= 0 || contribution <= 0 || !resultElement) {
            if(resultElement) resultElement.textContent = '0';
            return;
        }

        let baseAmount = 0;
        if (appliesTo === 'bonus') {
            baseAmount = bonus;
        } else { // bonus_deposit
            baseAmount = bonus + deposit;
        }

        const totalWagering = (baseAmount * req) / contribution;
        resultElement.textContent = `${totalWagering.toLocaleString('en-UK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // --- FAQ Accordions ---
    function initFaqAccordions() {
        const detailsElements = document.querySelectorAll('#faq-content details');
        detailsElements.forEach(details => {
            details.addEventListener('toggle', () => {
                if (details.open) {
                    // Close other open details
                    detailsElements.forEach(otherDetails => {
                        if (otherDetails !== details && otherDetails.open) {
                            otherDetails.open = false;
                        }
                    });
                }
            });
        });
    }

    /*
    function setCookie(name, value, days = 7) {
        const expires = new Date(Date.now() + days*864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    }

    function getCookie(name) {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=');
            return parts[0] === name ? decodeURIComponent(parts[1]) : r;
        }, null);
    }
    */

    function storeUrlParamsToCookies() {
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlParams.entries()) {
            setCookie(key, value);
        }
    }
    // --- Sticky Offer Banner ---
    function showStickyOfferBanner() {
        // Only show if cookies accepted and banner exists
        if (localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted' && stickyBanner) {
            // Get top offer from the data
            if (!window.siteData || !window.siteData.gameSites) return;
            const topOffer = window.siteData.gameSites.find(site => site.rank === 1) || window.siteData.gameSites[0];
            
            if(topOffer && stickyOfferSite && stickyOfferLink) {
                stickyOfferSite.textContent = topOffer.name;
                stickyOfferLink.href = replacePlaceholders(topOffer.siteUrl);

                /*
                let linkVisit = stickyOfferLink.href;
                const currentParams = window.location.search.slice(1);
                const separator = linkVisit.includes('?') ? '&' : '?';
                stickyOfferLink.href = linkVisit + separator + currentParams;

                stickyOfferLink.href = stickyOfferLink.href.replace(/\{(\w+)\}/g, (match, key) => {
                    return (new URLSearchParams(window.location.search)).get(key) || match;
                });
                */

                //stickyBanner.classList.remove('hidden');
                stickyBanner.classList.add('show');
            } else {
                stickyBanner.classList.remove('show'); // Hide if no offer found
            }
        }
    }
    
    function hideStickyOfferBanner() {
        if(stickyBanner) {
            stickyBanner.classList.remove('show');
            //stickyBanner.classList.add('hidden');
        }
    }

    // --- Cookie Consent ---
    function showCookieBanner() {

        if(cookieBanner && !localStorage.getItem(COOKIE_CONSENT_KEY)) {
            cookieBanner.classList.remove('hidden');
            cookieBanner.classList.add('show');
            document.body.classList.add('cookie-banner-visible'); // For sticky banner adjustment
        }
    }

    function hideCookieBanner() {
        if(cookieBanner) {
            cookieBanner.classList.remove('show');
            document.body.classList.remove('cookie-banner-visible');
        }
    }

    function setCookieConsent(consent) {
        localStorage.setItem(COOKIE_CONSENT_KEY, consent);
        hideCookieBanner();
        console.log(`Cookie consent set to: ${consent}`);
        
        if (consent === 'accepted') {
            // Initialize necessary tracking scripts
            initializeTracking();
            setTimeout(()=> {
                showStickyOfferBanner();
            }, 1000);
        } else {
            // Disable or don't load tracking scripts
            hideStickyOfferBanner(); // Hide sticky banner if rejected
        }
    }

    function initializeCookieConsent() {
        const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)??false;

        console.log(!savedConsent)
        if (!savedConsent) {
            showCookieBanner();
            hideStickyOfferBanner(); // Ensure hidden initially if no consent saved
        } else if (savedConsent === 'accepted') {
            initializeTracking(); // Init tracking if already accepted
            setTimeout(()=> {
                showStickyOfferBanner();
            }, 1000);
        } else {
            hideStickyOfferBanner(); // Ensure it's hidden if rejected previously
        }

        if(acceptBtn) acceptBtn.addEventListener('click', () => setCookieConsent('accepted'));
        if(rejectBtn) rejectBtn.addEventListener('click', () => setCookieConsent('rejected'));

        // Cookie settings just shows information message now
        /*
        function openCookieSettings() {
            alert("Cookie settings would normally appear here. For now, you can accept or reject all cookies.");
        }
        
        if(cookieSettingsBtn) cookieSettingsBtn.addEventListener('click', openCookieSettings);
        if(cookieSettingsLink) cookieSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            openCookieSettings();
        });
        */
    }

    // --- Exit Intent Popup ---
    function showExitIntentPopup() {
        // Check if popup exists, isn't already shown, and hasn't been shown before in this session/storage
        if (!exitIntentPopup || exitIntentPopup.classList.contains('show') || localStorage.getItem('exit_intent_shown')) return;

        // Populate with a good offer
        if (!window.siteData || !window.siteData.gameSites) return;
        const offer = window.siteData.gameSites.find(site => site.rating >= 4.8 && site.bonusHeadline.includes('')) || window.siteData.gameSites[0];
        
        if (offer && exitIntentOfferDiv && exitIntentLink) {
            exitIntentOfferDiv.innerHTML = `
                <img src="${offer.logo}" alt="${offer.name}" class="h-12 mx-auto mb-2 rounded">
                <p class="font-semibold text-lg text-white">${offer.name}</p>
                <p class="text-brand-secondary font-bold">${offer.bonusHeadline}</p>
                <p class="text-sm text-text-medium">${offer.bonusSubtext}</p>
            `;
            exitIntentLink.href = replacePlaceholders(offer.siteUrl);

            /*
            let linkVisit =  exitIntentLink.href;
            const currentParams = window.location.search.slice(1);
            const separator = linkVisit.includes('?') ? '&' : '?';
            exitIntentLink.href = linkVisit + separator + currentParams;

            exitIntentLink.href = exitIntentLink.href.replace(/\{(\w+)\}/g, (match, key) => {
                return (new URLSearchParams(window.location.search)).get(key) || match;
            });
            */

            exitIntentPopup.classList.remove('hidden');
            exitIntentPopup.classList.add('show'); // Add a class to track visibility state if needed
            document.body.style.overflow = 'hidden';
            localStorage.setItem('exit_intent_shown', 'true'); // Mark as shown
        }
    }

    function initializeExitIntent() {
        // Detect mouse leaving viewport
        document.addEventListener('mouseleave', (e) => {
            // Check if mouse is near the top edge
            if (e.clientY < 10 && !mouseLeftWindow) {
                mouseLeftWindow = true;
                // Delay slightly to avoid accidental triggers
                setTimeout(showExitIntentPopup, 500);
            }
        });
        
        // Reset flag if mouse re-enters
        document.addEventListener('mouseenter', () => {
            mouseLeftWindow = false;
        });

        exitIntentCloseButtons?.forEach(btn => {
            btn.addEventListener('click', () => {
                if(exitIntentPopup) {
                    exitIntentPopup.classList.add('hidden');
                    exitIntentPopup.classList.remove('show');
                }
                document.body.style.overflow = '';
            });
        });
        
        // Close on background click
        exitIntentPopup?.addEventListener('click', (e) => {
            if (e.target === exitIntentPopup) {
                exitIntentPopup.classList.add('hidden');
                exitIntentPopup.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Lazy Loading Images ---
    function lazyLoadImages() {
        const lazyImages = document.querySelectorAll('img.lazyload[data-src]');
        if ('IntersectionObserver' in window) {
            let imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        let img = entry.target;
                        const src = img.getAttribute('data-src');
                        if (src) {
                            img.onload = () => { // Optional: remove placeholder styles on load
                                img.classList.remove('lazyload');
                            };
                            img.onerror = () => { // Optional: handle image load errors
                                console.error(`Failed to load image: ${src}`);
                                img.classList.remove('lazyload'); // Still remove class
                            };
                            img.src = src;
                            img.removeAttribute('data-src');
                        } else {
                            img.classList.remove('lazyload'); // Remove class if no src found
                        }
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '0px 0px 100px 0px' }); // Load images 100px before they enter viewport
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers (load all immediately)
            lazyImages.forEach(img => {
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.classList.remove('lazyload');
                    img.removeAttribute('data-src');
                } else {
                    img.classList.remove('lazyload');
                }
            });
        }
    }

    // --- Placeholder for Tracking Initialization ---
    function initializeTracking() {
        console.log("Tracking Initialized (Placeholder - Add GA etc. here)");
        // Example: Add Google Analytics script or other tracking logic
    }

    // --- Site Search ---
    function setupSearch() {
        const searchInputs = [document.getElementById('site-search'), document.getElementById('mobile-search')];
        searchInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase().trim();
                    if (searchTerm.length > 1) {
                        console.log("Searching for:", searchTerm);
                        if (!window.siteData || !window.siteData.gameSites) return;
                        
                        // Simple filter on current table:
                        let filteredData = window.siteData.gameSites.filter(site =>
                            site.name.toLowerCase().includes(searchTerm) ||
                            (site.terms && site.terms.toLowerCase().includes(searchTerm)) || // Search terms too
                            (site.bonusHeadline && site.bonusHeadline.toLowerCase().includes(searchTerm)) // Search bonus headline
                        );
                        
                        renderTable(filteredData); 
                        showPage('home'); // Ensure table is visible
                    } else if (searchTerm.length === 0) {
                        // Restore original filters/sort when search is cleared
                        filterAndSortData();
                    }
                });
            }
        });
    }

    // --- Initial Execution ---
    function init() {
        // Fetch the data
        //fetch('data.json')
        fetch('/data')
            .then(response => response.json())
            .then(data => {
                window.siteData = data;
                
                startLoaderAnimation();
                
                // Initialize components in the correct order
                initializeCookieConsent(); // Setup cookie consent listeners and check status FIRST
                filterAndSortData(); // Initial render of the table with default sort/filter
                handleNavigation(); // Setup page switching and load initial page
                setupSearch(); // Setup search inputs
                setupFiltersAndSort(); // Setup filters and sort buttons
                initializeExitIntent(); // Setup exit intent listeners
                updateDateReferences(); // Update dynamic dates
                //updateLinksFromAhref(); // Update dynamic dates

                // Hide loader after a short delay to ensure content is ready
                setTimeout(hideLoader, 1500);

                // Lazy load non-critical components after initial load
                window.addEventListener('load', () => {
                    lazyLoadImages(); // Ensure images load after page structure ready
                });
            })
            .catch(error => {
                console.error('Error loading data:', error);
                hideLoader();
                
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-text-medium">Error loading site data. Please refresh the page.</td></tr>';
                }
            });
    }

    // Start the application
    init();
});