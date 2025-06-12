document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const usernameInput = document.getElementById('usernameInput');
    const searchBtn = document.getElementById('searchBtn');
    const profileSection = document.getElementById('profileSection');
    const errorSection = document.getElementById('errorSection');
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    const reviewText = document.getElementById('reviewText');
    const reviewsContainer = document.getElementById('reviewsContainer');
    const stars = document.querySelectorAll('.stars i');
    
    // Profile elements
    const avatar = document.getElementById('avatar');
    const name = document.getElementById('name');
    const username = document.getElementById('username');
    const bio = document.getElementById('bio');
    const followers = document.getElementById('followers');
    const following = document.getElementById('following');
    const repos = document.getElementById('repos');
    const location = document.getElementById('location');
    const blog = document.getElementById('blog');
    const twitter = document.getElementById('twitter');
    const company = document.getElementById('company');
    
    // State variables
    let currentUser = null;
    let selectedRating = 0;
    
    // Event Listeners
    searchBtn.addEventListener('click', fetchGitHubProfile);
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchGitHubProfile();
        }
    });
    
    submitReviewBtn.addEventListener('click', submitReview);
    
    // Star rating functionality
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            updateStars(selectedRating);
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            updateStars(rating, false);
        });
        
        star.addEventListener('mouseout', function() {
            updateStars(selectedRating);
        });
    });
    
    // Fetch GitHub profile
    async function fetchGitHubProfile() {
        const username = usernameInput.value.trim();
        if (!username) return;
        
        try {
            const response = await fetch(`https://api.github.com/users/${username}`);
            
            if (!response.ok) {
                throw new Error('Profile not found');
            }
            
            const data = await response.json();
            currentUser = data;
            displayProfile(data);
            loadReviews(username);
            
            profileSection.classList.remove('hidden');
            errorSection.classList.add('hidden');
        } catch (error) {
            console.error('Error fetching GitHub profile:', error);
            profileSection.classList.add('hidden');
            errorSection.classList.remove('hidden');
        }
    }
    
    // Display profile data
    function displayProfile(profile) {
        avatar.src = profile.avatar_url;
        name.textContent = profile.name || profile.login;
        username.textContent = `@${profile.login}`;
        bio.textContent = profile.bio || 'No bio available';
        followers.textContent = profile.followers;
        following.textContent = profile.following;
        repos.textContent = profile.public_repos;
        
        // Handle optional fields
        location.textContent = profile.location || 'Not specified';
        
        if (profile.blog) {
            blog.textContent = profile.blog;
            blog.href = profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`;
            blog.parentElement.style.display = 'flex';
        } else {
            blog.parentElement.style.display = 'none';
        }
        
        if (profile.twitter_username) {
            twitter.textContent = `@${profile.twitter_username}`;
            twitter.parentElement.style.display = 'flex';
        } else {
            twitter.parentElement.style.display = 'none';
        }
        
        if (profile.company) {
            company.textContent = profile.company;
            company.parentElement.style.display = 'flex';
        } else {
            company.parentElement.style.display = 'none';
        }
    }
    
    // Update star rating display
    function updateStars(rating, permanent = true) {
        stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= rating) {
                star.classList.add('active');
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('active');
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
        
        if (permanent) {
            selectedRating = rating;
        }
    }
    
    // Submit review
    function submitReview() {
        if (!currentUser) return;
        
        const review = reviewText.value.trim();
        if (!review || selectedRating === 0) {
            alert('Please provide both a rating and review text');
            return;
        }
        
        // Create review object
        const reviewObj = {
            username: currentUser.login,
            author: 'Anonymous', // In a real app, you'd have user authentication
            rating: selectedRating,
            text: review,
            date: new Date().toISOString()
        };
        
        // Save to localStorage
        saveReview(reviewObj);
        
        // Add to UI
        addReviewToUI(reviewObj);
        
        // Reset form
        reviewText.value = '';
        selectedRating = 0;
        updateStars(0);
    }
    
    // Save review to localStorage
    function saveReview(review) {
        let reviews = JSON.parse(localStorage.getItem('githubReviews')) || [];
        reviews.push(review);
        localStorage.setItem('githubReviews', JSON.stringify(reviews));
    }
    
    // Load reviews for a user
    function loadReviews(username) {
        reviewsContainer.innerHTML = '';
        
        let reviews = JSON.parse(localStorage.getItem('githubReviews')) || [];
        const userReviews = reviews.filter(review => review.username === username);
        
        if (userReviews.length === 0) {
            reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
            return;
        }
        
        userReviews.forEach(review => {
            addReviewToUI(review);
        });
    }
    
    // Add review to UI
    function addReviewToUI(review) {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        
        const starsHTML = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        
        reviewCard.innerHTML = `
            <div class="review-header">
                <span class="review-author">${review.author}</span>
                <span class="review-date">${formatDate(review.date)}</span>
            </div>
            <div class="review-rating">${starsHTML}</div>
            <div class="review-text">${review.text}</div>
        `;
        
        reviewsContainer.prepend(reviewCard);
    }
    
    // Format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});