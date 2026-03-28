// auth.js
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LOCAL STORAGE INIT ---
    let currentUser = JSON.parse(localStorage.getItem('urban_edge_user')) || null;
    
    // --- 2. INJECT CSS FOR AUTH MODAL & BADGE ---
    const authStyle = document.createElement('style');
    authStyle.innerHTML = `
        /* Glassmorphism Auth Overlay */
        #ue-auth-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(5px);
            z-index: 1060; display: flex; align-items: center; justify-content: center;
            opacity: 0; visibility: hidden; transition: opacity 0.3s ease;
        }
        #ue-auth-overlay.active { opacity: 1; visibility: visible; }
        
        .ue-auth-box {
            background: rgba(255,255,255,0.95); border-radius: 12px;
            width: 90%; max-width: 400px; padding: 40px; position: relative;
            transform: translateY(20px); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        #ue-auth-overlay.active .ue-auth-box { transform: translateY(0); }
        
        .ue-auth-close {
            position: absolute; top: 15px; right: 15px; font-size: 20px;
            cursor: pointer; color: #777; transition: color 0.2s;
        }
        .ue-auth-close:hover { color: #d34e2a; }
        
        /* Auth Form Switches */
        .ue-auth-tabs { display: flex; border-bottom: 2px solid #eee; margin-bottom: 25px; }
        .ue-auth-tab {
            flex: 1; text-align: center; padding: 10px; cursor: pointer;
            font-family: 'Archivo Black', sans-serif; text-transform: uppercase;
            color: #ccc; font-size: 14px; transition: color 0.2s; border-bottom: 2px solid transparent;
            margin-bottom: -2px;
        }
        .ue-auth-tab.active { color: #111; border-bottom-color: #d34e2a; }
        
        .ue-auth-form { display: none; }
        .ue-auth-form.active { display: block; animation: fadeIn 0.4s; }
        
        /* User Profile Initials Badge */
        .ue-user-badge {
            width: 32px; height: 32px; border-radius: 50%;
            background-color: #111; color: white; display: flex;
            align-items: center; justify-content: center; font-weight: bold;
            font-size: 12px; cursor: pointer; text-transform: uppercase;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #fff;
        }
        .ue-user-badge:hover { background-color: #d34e2a; }
        
        /* Dropdown Account Menu */
        .ue-account-dropdown {
            position: absolute; top: calc(100% + 10px); right: 0;
            background: white; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            min-width: 200px; padding: 15px 0; z-index: 1050; border: 1px solid #efefef;
            opacity: 0; visibility: hidden; transform: translateY(10px); transition: all 0.2s;
        }
        .ue-account-dropdown.show { opacity: 1; visibility: visible; transform: translateY(0); }
        .ue-account-dropdown .dropdown-header { padding: 0 20px 10px; border-bottom: 1px dashed #ddd; margin-bottom: 10px; }
        .ue-account-dropdown a { display: block; padding: 8px 20px; color: #555; text-decoration: none; font-size: 13px; font-weight: 600; }
        .ue-account-dropdown a:hover { color: #d34e2a; background: #fafafa; }
        .ue-account-dropdown .sign-out { border-top: 1px solid #eee; margin-top: 5px; padding-top: 10px; color: #ff3300; }
    `;
    document.head.appendChild(authStyle);

    // --- 3. INJECT HTML FOR AUTH MODAL ---
    const authHtml = `
        <div id="ue-auth-overlay">
            <div class="ue-auth-box">
                <i class="fa-solid fa-xmark ue-auth-close" onclick="closeAuthModal()"></i>
                
                <div class="ue-auth-tabs">
                    <div class="ue-auth-tab active" data-target="login">Sign In</div>
                    <div class="ue-auth-tab" data-target="register">Join The Culture</div>
                </div>
                
                <!-- Login Form -->
                <form id="ue-login-form" class="ue-auth-form active">
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Email Address</label>
                        <input type="email" class="form-control rounded-0 p-2 bg-light border-0" id="l-email" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-bold small text-muted">Password</label>
                        <input type="password" class="form-control rounded-0 p-2 bg-light border-0" id="l-pwd" required>
                    </div>
                    <button type="submit" class="btn btn-dark w-100 rounded-0 py-3 fw-bold text-uppercase" style="letter-spacing: 1px;">Sign In</button>
                    <p class="text-center mt-3 mb-0 small"><a href="#" class="text-muted text-decoration-none">Forgot Password?</a></p>
                </form>
                
                <!-- Register Form -->
                <form id="ue-register-form" class="ue-auth-form">
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Full Name</label>
                        <input type="text" class="form-control rounded-0 p-2 bg-light border-0" id="r-name" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Email Address</label>
                        <input type="email" class="form-control rounded-0 p-2 bg-light border-0" id="r-email" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-bold small text-muted">Create Password</label>
                        <input type="password" class="form-control rounded-0 p-2 bg-light border-0" id="r-pwd" required minlength="6">
                    </div>
                    <button type="submit" class="btn w-100 rounded-0 py-3 fw-bold text-uppercase text-white" style="letter-spacing: 1px; background-color: #d34e2a;">Create Account</button>
                </form>
                
                <!-- Success Message Screen -->
                <div id="ue-success-message" class="ue-auth-form text-center py-4">
                    <div style="width: 80px; height: 80px; background: #28a745; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 35px; margin: 0 auto 20px;">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <h4 class="fw-bolder text-uppercase mb-2" style="font-family: 'Archivo Black', sans-serif;">Congratulations</h4>
                    <h5 class="fw-bold text-dark mb-1" id="ue-success-username"></h5>
                    <p class="text-muted small mb-4">Your account was created successfully.</p>
                    <button class="btn btn-dark w-100 rounded-0 py-3 fw-bold text-uppercase" onclick="closeAuthModal()" style="letter-spacing: 1px;">Continue Shopping</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', authHtml);

    // --- 4. AUTH MODAL LOGIC API ---
    window.openAuthModal = () => document.getElementById('ue-auth-overlay').classList.add('active');
    
    window.closeAuthModal = () => {
        document.getElementById('ue-auth-overlay').classList.remove('active');
        setTimeout(() => {
            // Revert back all styles instantly when hidden
            document.querySelectorAll('.ue-auth-tab').forEach(t => t.style.display = 'block');
            document.querySelector('.ue-auth-tabs').style.display = 'flex';
            document.getElementById('ue-success-message').classList.remove('active');
            
            // Re-activate first tab
            document.querySelectorAll('.ue-auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.ue-auth-form').forEach(f => f.classList.remove('active'));
            document.querySelector('.ue-auth-tab[data-target="login"]').classList.add('active');
            document.getElementById('ue-login-form').classList.add('active');
            
            // clear forms
            document.getElementById('ue-login-form').reset();
            document.getElementById('ue-register-form').reset();
        }, 300);
    };

    // Tab Switching
    document.querySelectorAll('.ue-auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.ue-auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.ue-auth-form').forEach(f => f.classList.remove('active'));
            
            this.classList.add('active');
            const target = this.dataset.target;
            if(target === 'login') document.getElementById('ue-login-form').classList.add('active');
            else document.getElementById('ue-register-form').classList.add('active');
        });
    });

    // Form Submissions
    document.getElementById('ue-register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('r-name').value;
        const email = document.getElementById('r-email').value;
        
        currentUser = { name, email, initials: name.substring(0,2).toUpperCase() };
        localStorage.setItem('urban_edge_user', JSON.stringify(currentUser));
        
        // Setup Success Screen overlay instead of closing
        document.querySelectorAll('.ue-auth-tab').forEach(t => t.style.display = 'none');
        document.querySelector('.ue-auth-tabs').style.display = 'none';
        document.querySelectorAll('.ue-auth-form').forEach(f => f.classList.remove('active'));
        
        document.getElementById('ue-success-username').innerText = currentUser.name;
        const msgBlock = document.getElementById('ue-success-message');
        msgBlock.querySelector('p').innerText = "Your account was created successfully.";
        msgBlock.classList.add('active');
        
        updateUserIcons();
    });

    document.getElementById('ue-login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('l-email').value;
        // Mocking: Just accept any login and extract name from email
        const pseudoName = email.split('@')[0];
        
        currentUser = { name: pseudoName, email, initials: pseudoName.substring(0,2).toUpperCase() };
        localStorage.setItem('urban_edge_user', JSON.stringify(currentUser));
        
        // Setup Success Screen overlay instead of closing
        document.querySelectorAll('.ue-auth-tab').forEach(t => t.style.display = 'none');
        document.querySelector('.ue-auth-tabs').style.display = 'none';
        document.querySelectorAll('.ue-auth-form').forEach(f => f.classList.remove('active'));
        
        document.getElementById('ue-success-username').innerText = currentUser.name;
        const msgBlock = document.getElementById('ue-success-message');
        msgBlock.querySelector('p').innerText = "You have successfully signed in.";
        msgBlock.classList.add('active');
        
        updateUserIcons();
    });

    // --- 5. BIND TO NAVBAR USER ICONS ---
    function updateUserIcons() {
        const userNavContainers = document.querySelectorAll('.nav-icons .d-flex.gap-3');
        
        // Ensure a single global click handler for clicking outside dropdown
        document.addEventListener('click', (e) => {
            if(!e.target.closest('.ue-account-wrapper')) {
                document.querySelectorAll('.ue-account-dropdown').forEach(d => d.classList.remove('show'));
            }
        });

        userNavContainers.forEach(container => {
            // Find the anchor that contains the fa-user
            const userLinks = container.querySelectorAll('a');
            let userAnchor = null;
            userLinks.forEach(link => {
                if(link.innerHTML.includes('fa-user')) userAnchor = link;
            });
            
            // Or if we already converted it to a wrapper, find that instead
            let wrapper = container.querySelector('.ue-account-wrapper');

            if(!currentUser) {
                // Logged OUT STATE
                if(wrapper) {
                    // Revert wrapper to a simple icon
                    const a = document.createElement('a');
                    a.href = '#';
                    a.className = 'fs-5 text-dark';
                    a.style.textDecoration = 'none';
                    a.innerHTML = '<i class="fa-regular fa-user"></i>';
                    a.addEventListener('click', (e) => { e.preventDefault(); openAuthModal(); });
                    container.replaceChild(a, wrapper);
                } else if(userAnchor) {
                    // Bind vanilla icon to open modal
                    userAnchor.removeAttribute('href');
                    userAnchor.style.cursor = 'pointer';
                    // clear clones to remove old listeners
                    let newAnchor = userAnchor.cloneNode(true);
                    userAnchor.parentNode.replaceChild(newAnchor, userAnchor);
                    newAnchor.addEventListener('click', (e) => { e.preventDefault(); openAuthModal(); });
                }
            } else {
                // Logged IN STATE
                if(userAnchor || wrapper) {
                    const existingNode = wrapper || userAnchor;
                    
                    const newWrapper = document.createElement('div');
                    newWrapper.className = 'position-relative ue-account-wrapper';
                    
                    newWrapper.innerHTML = `
                        <div class="ue-user-badge" title="${currentUser.name}">${currentUser.initials}</div>
                        <div class="ue-account-dropdown">
                            <div class="dropdown-header">
                                <h6 class="fw-bold mb-0 text-truncate">${currentUser.name}</h6>
                                <p class="text-muted small mb-0 text-truncate">${currentUser.email}</p>
                            </div>
                            <a href="track.html"><i class="fa-solid fa-truck-fast me-2"></i>Track Order</a>
                            <a href="wishlist.html"><i class="fa-solid fa-heart me-2"></i>Wishlist</a>
                            <a href="#" class="sign-out"><i class="fa-solid fa-arrow-right-from-bracket me-2"></i>Sign Out</a>
                        </div>
                    `;

                    // Dropdown interaction
                    newWrapper.querySelector('.ue-user-badge').addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Close others
                        document.querySelectorAll('.ue-account-dropdown').forEach(d => {
                            if(d !== newWrapper.querySelector('.ue-account-dropdown')) d.classList.remove('show');
                        });
                        newWrapper.querySelector('.ue-account-dropdown').classList.toggle('show');
                    });

                    // Sign Out interaction
                    newWrapper.querySelector('.sign-out').addEventListener('click', (e) => {
                        e.preventDefault();
                        if (confirm("Are you sure you want to log out?")) {
                            localStorage.removeItem('urban_edge_user');
                            currentUser = null;
                            updateUserIcons();
                            window.location.reload();
                        }
                    });

                    existingNode.parentNode.replaceChild(newWrapper, existingNode);
                }
            }
        });
    }

    // Initial Trigger
    setTimeout(updateUserIcons, 100);
});
