// Documentation Engine: Search, Dynamic Routing & Theme Management
document.addEventListener('DOMContentLoaded', () => {
    const isTurkish = window.location.pathname.includes('/docs/tr');

    // Theme Switcher (System / Light / Dark)
    const themeButtons = document.querySelectorAll('.docs-theme-btn');
    const savedTheme = localStorage.getItem('docs-theme') || 'light';

    function applyTheme(theme) {
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }

        themeButtons.forEach(btn => {
            if (btn.getAttribute('data-theme') === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    applyTheme(savedTheme);

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            localStorage.setItem('docs-theme', theme);
            applyTheme(theme);
        });
    });

    // System theme observer
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('docs-theme') === 'system') {
            applyTheme('system');
        }
    });

    // Language Dropdown Toggle
    const langPill = document.querySelector('.docs-lang-pill');
    const langDropdown = document.querySelector('.docs-lang-dropdown');

    if (langPill && langDropdown) {
        langPill.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!langDropdown.contains(e.target) && !langPill.contains(e.target)) {
                langDropdown.classList.remove('open');
            }
        });
    }

    // Mobile Drawer Toggle
    const menuBtn = document.querySelector('.docs-menu-toggle');
    const sidebar = document.querySelector('.docs-sidebar');
    
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuBtn.contains(e.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Collapsible Sidebar Folders (Tree Navigation & Accordion)
    const sidebarFolders = document.querySelectorAll('.docs-sidebar-folder, .docs-sidebar-group');
    sidebarFolders.forEach(folder => {
        const title = folder.querySelector('.docs-sidebar-folder-title, .docs-sidebar-title');
        if (!title) return;

        // Add subtle chevron arrow if not present
        if (!title.querySelector('.docs-sidebar-chevron')) {
            const chevron = document.createElement('span');
            chevron.className = 'docs-sidebar-chevron';
            chevron.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            title.appendChild(chevron);
        }

        // Toggle accordion on folder header click
        title.addEventListener('click', () => {
            folder.classList.toggle('collapsed');
        });
    });

    // TOC: Copy Page Action
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.docs-copy-page-btn');
        if (!btn) return;
        try {
            await navigator.clipboard.writeText(window.location.href);
            const span = btn.querySelector('span');
            const originalText = span ? span.textContent : '';
            btn.classList.add('copied');
            if (span) span.textContent = isTurkish ? 'Bağlantı Kopyalandı' : 'Link Copied';
            setTimeout(() => {
                btn.classList.remove('copied');
                if (span) span.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Kopyalama hatası:', err);
        }
    });

    // Centered Search Modal (⌘K / Ctrl+K)
    const modalBackdrop = document.querySelector('.docs-modal-backdrop');
    const searchInput = document.querySelector('.docs-modal-input');
    const resultsContainer = document.querySelector('.docs-modal-results');

    // Comprehensive Search Index
    const searchData = isTurkish ? [
        { title: 'Hoş Geldiniz', desc: 'HAN Interactive Entertainment dokümantasyon ana sayfası.', href: '/docs/tr/' },
        { title: '100 Temel Blueprint Node (UE5)', desc: 'YouTube serisi: Unreal Engine 5 temel blueprint düğümleri indeksi.', href: '/docs/tr/blueprint/' },
        { title: 'Branch (Koşul Dalı)', desc: 'Boolean mantıksal koşula göre yürütme akışını ayıran temel node (if-else).', href: '/docs/tr/blueprint/flow-control/branch/' },
        { title: 'Sequence (Sıralı Akış)', desc: 'Birden fazla çıkışı aynı karede sırayla ve senkron çalıştıran node.', href: '/docs/tr/blueprint/flow-control/sequence/' },
        { title: 'Set Timer by Event', desc: 'Event Tick yerine periyodik veya döngüsel asenkron zamanlayıcı çalıştıran node.', href: '/docs/tr/blueprint/timers/set-timer-by-event/' },
        { title: 'Line Trace By Channel', desc: 'İki 3D nokta arasında fiziksel ışın göndererek çarpışma ve yüzey testi yapan node (Raycast).', href: '/docs/tr/blueprint/collision/line-trace-by-channel/' },
        { title: 'SpawnActorFromClass', desc: 'Çalışma zamanında (runtime) dünyaya yeni aktör türeten node.', href: '/docs/tr/blueprint/actor/spawn-actor-from-class/' },
        { title: 'Canlı Blueprint Kodlayıcı (Playground)', desc: 'Panodan kopyalanan Unreal Engine blueprint kodlarını canlı grafik olarak render eden araç.', href: '/docs/tr/blueprint/sandbox/' },
        { title: 'Giriş & Vizyon', desc: 'Stüdyomuz, üretim felsefemiz ve dijital deneyimler.', href: '/docs/tr/intro/' },
        { title: 'Destek & İletişim', desc: 'Teknik destek, ortaklıklar ve doğrudan iletişim kanalları.', href: '/docs/tr/support/' },
        { title: 'Fab: İndirme ve Kurulum', desc: 'Fab mağazasından ürünleri indirme ve projelere aktarma kılavuzu.', href: '/docs/tr/fab/getting-started/' },
        { title: 'Fab: Unreal Engine 5 Entegrasyonu', desc: 'Nanite, Lumen, Virtual Texture ve Master Material kurulumları.', href: '/docs/tr/fab/unreal-engine/' },
        { title: 'Fab: Unity Entegrasyonu', desc: 'URP ve HDRP materyal dönüşümleri ve Prefab entegrasyonu.', href: '/docs/tr/fab/unity/' },
        { title: 'Fab: Optimizasyon Standartları', desc: 'Draw call, LOD, çarpışma (collision) ve doku paketleme standartları.', href: '/docs/tr/fab/optimization/' }
    ] : [
        { title: 'Welcome', desc: 'Main hub for HAN Interactive Entertainment official documentation.', href: '/docs/' },
        { title: '100 Essential Blueprint Nodes (UE5)', desc: 'YouTube series: Unreal Engine 5 core blueprint nodes index and reference.', href: '/docs/blueprint/' },
        { title: 'Branch', desc: 'Conditional execution node evaluating boolean expressions.', href: '/docs/tr/blueprint/flow-control/branch/' },
        { title: 'Sequence', desc: 'Linear multi-execution node running pins consecutively in same frame.', href: '/docs/tr/blueprint/flow-control/sequence/' },
        { title: 'Set Timer by Event', desc: 'Periodic and looping timer execution node replacing heavy Event Tick.', href: '/docs/tr/blueprint/timers/set-timer-by-event/' },
        { title: 'Line Trace By Channel', desc: 'Raycast collision detection between 3D vectors.', href: '/docs/tr/blueprint/collision/line-trace-by-channel/' },
        { title: 'SpawnActorFromClass', desc: 'Runtime dynamic actor spawning and transform placement.', href: '/docs/tr/blueprint/actor/spawn-actor-from-class/' },
        { title: 'Live Blueprint Sandbox', desc: 'Interactive visualizer parsing UE clipboard text.', href: '/docs/tr/blueprint/sandbox/' },
        { title: 'Introduction & Vision', desc: 'Studio overview, creative philosophy and digital experiences.', href: '/docs/intro/' },
        { title: 'Support & Inquiries', desc: 'Direct technical assistance, commercial licensing and partnerships.', href: '/docs/support/' },
        { title: 'Fab: Download & Installation', desc: 'Step-by-step guide to acquiring and importing assets from Fab.', href: '/docs/fab/getting-started/' },
        { title: 'Fab: Unreal Engine 5 Integration', desc: 'Nanite, Lumen, Virtual Textures and Master Material workflow.', href: '/docs/fab/unreal-engine/' },
        { title: 'Fab: Unity Integration', desc: 'URP, HDRP pipelines and Shader Graph prefab workflow.', href: '/docs/fab/unity/' },
        { title: 'Fab: Optimization & Guidelines', desc: 'Draw calls, LOD hierarchies, collision mesh and ORM packing standards.', href: '/docs/fab/optimization/' }
    ];

    function openSearch() {
        const modal = document.querySelector('.docs-modal-backdrop') || document.getElementById('docs-search-modal');
        const input = document.querySelector('.docs-modal-input');
        if (modal) {
            modal.classList.add('open');
            if (input) {
                input.value = '';
                renderSearchResults('');
                setTimeout(() => input.focus(), 50);
            }
        }
    }

    function closeSearch() {
        const modal = document.querySelector('.docs-modal-backdrop') || document.getElementById('docs-search-modal');
        if (modal) {
            modal.classList.remove('open');
        }
    }

    function renderSearchResults(query) {
        const results = document.querySelector('.docs-modal-results');
        if (!results) return;
        const q = (query || '').toLowerCase().trim();
        const filtered = q ? searchData.filter(d => d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)) : searchData;

        if (filtered.length === 0) {
            results.innerHTML = `<div class="docs-modal-empty">${isTurkish ? 'Sonuç bulunamadı.' : 'No matching results found.'}</div>`;
            return;
        }

        results.innerHTML = filtered.map(item => `
            <a href="${item.href}" class="docs-modal-item">
                <span class="docs-modal-item-title">${item.title}</span>
                <span class="docs-modal-item-desc">${item.desc}</span>
            </a>
        `).join('');

        results.querySelectorAll('.docs-modal-item').forEach(el => {
            el.addEventListener('click', () => closeSearch());
        });
    }

    // Global Search trigger (clicks on any search button or trigger)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.docs-search-btn') || e.target.closest('[data-open-search]')) {
            e.preventDefault();
            openSearch();
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => renderSearchResults(e.target.value));
    }

    document.addEventListener('click', (e) => {
        const modal = document.querySelector('.docs-modal-backdrop.open') || document.querySelector('#docs-search-modal.open');
        if (modal && e.target === modal) {
            closeSearch();
        }
    });

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            const modal = document.querySelector('.docs-modal-backdrop.open') || document.querySelector('#docs-search-modal.open');
            if (modal) {
                closeSearch();
            } else {
                openSearch();
            }
        }
        if (e.key === 'Escape') {
            closeSearch();
            if (sidebar) sidebar.classList.remove('open');
            if (langDropdown) langDropdown.classList.remove('open');
        }
    });

    // Dynamic Headings Anchor Links (# on hover)
    const articleHeadings = Array.from(document.querySelectorAll('.docs-article h1[id], .docs-article h2[id], .docs-article h3[id]'));
    articleHeadings.forEach(h => {
        if (!h.querySelector('.docs-heading-anchor')) {
            const anchor = document.createElement('a');
            anchor.className = 'docs-heading-anchor';
            anchor.href = '#' + h.id;
            anchor.setAttribute('aria-label', 'Bu başlığa git');
            anchor.textContent = '#';
            h.appendChild(anchor);
        }
    });

    // Dynamic TOC (Table of Contents) Scroll Spy & Smooth Scroll
    const tocLinks = Array.from(document.querySelectorAll('.docs-toc-link'));
    if (articleHeadings.length > 0 && tocLinks.length > 0) {
        const headerOffset = 75;
        let ticking = false;

        function setActiveTOC(id) {
            if (!id) return;
            tocLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === '#' + id) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        function updateActiveTOC() {
            const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Near bottom of page -> activate last heading
            if (scrollPos + windowHeight >= documentHeight - 60) {
                const last = articleHeadings[articleHeadings.length - 1];
                if (last) {
                    setActiveTOC(last.id);
                    ticking = false;
                    return;
                }
            }

            let currentId = articleHeadings[0] ? articleHeadings[0].id : null;
            const triggerOffset = 130;

            for (let i = 0; i < articleHeadings.length; i++) {
                const rect = articleHeadings[i].getBoundingClientRect();
                if (rect.top <= triggerOffset) {
                    currentId = articleHeadings[i].id;
                }
            }

            setActiveTOC(currentId);
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateActiveTOC);
                ticking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateActiveTOC);
                ticking = true;
            }
        }, { passive: true });

        // Initial sync
        updateActiveTOC();

        // Smooth scroll for TOC links
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                        const top = targetEl.getBoundingClientRect().top + scrollY - headerOffset;
                        window.scrollTo({
                            top: top,
                            behavior: 'smooth'
                        });
                        history.pushState(null, null, targetId);
                        setActiveTOC(targetId.substring(1));
                    }
                }
            });
        });
    }
});
