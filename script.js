document.addEventListener('DOMContentLoaded', () => {
    console.log('Script initialized successfully');
    
    // Theme toggle functionality
    const themeBtn = document.getElementById('theme-btn');
    const lightIcon = document.getElementById('light-icon');
    const darkIcon = document.getElementById('dark-icon');
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);

    function updateThemeIcons(theme) {
        lightIcon.style.display = theme === 'dark' ? 'none' : 'block';
        darkIcon.style.display = theme === 'dark' ? 'block' : 'none';
    }
    
    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    });

    // Menu toggle functionality
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    
    // Check if elements exist to prevent null reference errors
    if (!menuBtn || !sidebar) {
        console.error('Menu button or sidebar not found');
        return;
    }
    
    // Toggle sidebar function
    function toggleSidebar() {
        const isOpen = document.body.classList.contains('sidebar-open');
        
        if (isOpen) {
            document.body.classList.remove('sidebar-open');
            console.log('Sidebar closed');
        } else {
            document.body.classList.add('sidebar-open');
            console.log('Sidebar opened');
        }
    }
    
    // Add event listener to menu button
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        toggleSidebar();
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        // Only proceed if sidebar is open and click is not on sidebar or menu button
        if (document.body.classList.contains('sidebar-open') && 
            !sidebar.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            document.body.classList.remove('sidebar-open');
            console.log('Sidebar closed by outside click');
        }
    });
    
    // All main sections of the page
    const sections = document.querySelectorAll('section[id]');
    const navLinks = sidebar.querySelectorAll('a');
    
    // Click-based navigation with optional hash-based URL updates
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get section ID from href
            const sectionId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(sectionId);
            
            if (targetSection) {
                // Reset all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Set this link as active
                link.classList.add('active');
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetSection.offsetTop - 70, // Adjust for header
                    behavior: 'smooth'
                });
                
                // Update URL hash
                history.pushState(null, '', `#${sectionId}`);
                
                // Close sidebar on mobile
                if (window.innerWidth <= 768) {
                    document.body.classList.remove('sidebar-open');
                }
            }
        });
    });
    
    // Very simple scroll spy - find section closest to top of viewport
    function updateNavOnScroll() {
        // Get current scroll position with offset for header
        const scrollPos = window.scrollY + 100;
        
        // Track which section is closest to the scrollPos
        let currentSection = null;
        let minDistance = Number.MAX_VALUE;
        
        // Check each section
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const distance = Math.abs(scrollPos - sectionTop);
            
            // If this section is closer to our scroll position than previous best
            if (distance < minDistance) {
                minDistance = distance;
                currentSection = section;
            }
        });
        
        // If we found a section, highlight it in the nav
        if (currentSection) {
            const sectionId = currentSection.id;
            const targetLink = sidebar.querySelector(`a[href="#${sectionId}"]`);
            
            if (targetLink && !targetLink.classList.contains('active')) {
                navLinks.forEach(link => link.classList.remove('active'));
                targetLink.classList.add('active');
            }
        }
    }
    
    // Use requestAnimationFrame for smoother scrolling
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            // Use requestAnimationFrame for better performance
            window.requestAnimationFrame(() => {
                updateNavOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Set initial active link based on URL hash or first section
    function setInitialActiveLink() {
        const hash = window.location.hash;
        let targetLink;
        
        if (hash) {
            targetLink = sidebar.querySelector(`a[href="${hash}"]`);
        }
        
        if (!targetLink && navLinks.length > 0) {
            targetLink = navLinks[0];
        }
        
        if (targetLink) {
            navLinks.forEach(link => link.classList.remove('active'));
            targetLink.classList.add('active');
        }
    }
    
    // Initialize navigation
    setInitialActiveLink();
    updateNavOnScroll();
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // Close sidebar on larger screens
        if (window.innerWidth > 768) {
            document.body.classList.remove('sidebar-open');
        }
        
        // Update navigation after resize with debounce
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateNavOnScroll();
        }, 200);
    });
    
    // Add touch event handling for better mobile experience
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeThreshold = 100; // minimum distance for swipe
        
        // Right to left swipe (close sidebar)
        if (touchEndX < touchStartX - swipeThreshold && document.body.classList.contains('sidebar-open')) {
            document.body.classList.remove('sidebar-open');
            console.log('Sidebar closed by swipe');
        }
        
        // Left to right swipe (open sidebar)
        if (touchEndX > touchStartX + swipeThreshold && !document.body.classList.contains('sidebar-open')) {
            document.body.classList.add('sidebar-open');
            console.log('Sidebar opened by swipe');
        }
    }
});