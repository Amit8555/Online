// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formDetails = {};
        formData.forEach((value, key) => {
            formDetails[key] = value;
        });

        // Show success message (in production, you'd want to send this to a server)
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
}

// Login Modal Functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'flex';
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    // Restore background scrolling
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLoginModal();
    }
}

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('teacherEmail').value;
        const password = document.getElementById('teacherPassword').value;
        
        // Here you would typically send these credentials to a server
        // For now, we'll just show an alert
        alert('Login functionality will be implemented on the server side.');
        
        // Clear form and close modal
        this.reset();
        closeLoginModal();
    });
}

// Student Modal Functions
function openStudentModal() {
    const modal = document.getElementById('studentModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeStudentModal() {
    const modal = document.getElementById('studentModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function switchStudentForm(formType) {
    const loginForm = document.getElementById('studentLoginForm');
    const registerForm = document.getElementById('studentRegisterForm');
    
    if (formType === 'register') {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

// Handle student login
const loginStudentForm = document.getElementById('loginStudentForm');
if (loginStudentForm) {
    loginStudentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const studentId = document.getElementById('studentId').value;
        const password = document.getElementById('studentPassword').value;
        
        // Here you would typically send these credentials to a server
        // For now, we'll just show a success message
        alert(`Welcome back, Student ${studentId}!`);
        this.reset();
        closeStudentModal();
    });
}

// Handle student registration
const registerStudentForm = document.getElementById('registerStudentForm');
if (registerStudentForm) {
    registerStudentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const course = document.getElementById('regCourse').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Basic validation
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Generate a random student ID (in production this would come from the server)
        const studentId = 'STU' + Math.floor(100000 + Math.random() * 900000);
        
        // Here you would typically send this data to a server
        // For now, we'll just show a success message
        alert(`Registration successful!\nYour Student ID is: ${studentId}\nPlease save this ID for login.`);
        
        this.reset();
        switchStudentForm('login'); // Switch back to login form
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const studentModal = document.getElementById('studentModal');
    const loginModal = document.getElementById('loginModal');
    const jobModal = document.getElementById('jobModal');
    
    if (event.target === studentModal) {
        closeStudentModal();
    } else if (event.target === loginModal) {
        closeLoginModal();
    } else if (event.target === jobModal) {
        closeJobModal();
    }
}

// Job Details Data
const jobDetails = {
    'Google': {
        'Software Engineer': {
            description: [
                'Develop and maintain Google\'s core products and services',
                'Write clean, efficient, and maintainable code',
                'Collaborate with cross-functional teams',
                'Participate in code reviews and technical discussions'
            ],
            requirements: [
                'BCA degree with excellent academic record',
                'Strong programming skills in Java, Python, or C++',
                'Good understanding of data structures and algorithms',
                'Problem-solving skills and analytical thinking'
            ],
            package: '₹15-20 LPA + Benefits'
        }
    },
    'Microsoft': {
        'Full Stack Developer': {
            description: [
                'Build scalable web applications using Microsoft technologies',
                'Work on both frontend and backend development',
                'Implement security and data protection measures',
                'Optimize applications for maximum speed and scalability'
            ],
            requirements: [
                'BCA with focus on web development',
                'Experience with .NET, C#, and JavaScript',
                'Knowledge of SQL and NoSQL databases',
                'Understanding of cloud services (Azure)'
            ],
            package: '₹12-18 LPA + Benefits'
        }
    },
    'Amazon': {
        'Cloud Engineer': {
            description: [
                'Design and implement AWS cloud solutions',
                'Manage and optimize cloud infrastructure',
                'Ensure high availability and disaster recovery',
                'Implement security best practices'
            ],
            requirements: [
                'BCA with cloud computing knowledge',
                'AWS certification preferred',
                'Understanding of Linux/Unix systems',
                'Experience with Infrastructure as Code'
            ],
            package: '₹10-15 LPA + Benefits'
        }
    }
};

// Job Modal Functions
function showJobDetails(company, position) {
    const modal = document.getElementById('jobModal');
    const details = jobDetails[company][position];
    
    document.getElementById('companyName').textContent = company;
    document.getElementById('position').textContent = position;
    
    // Clear and populate job description
    const descriptionList = document.getElementById('jobDescription');
    descriptionList.innerHTML = '';
    details.description.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        descriptionList.appendChild(li);
    });
    
    // Clear and populate requirements
    const requirementsList = document.getElementById('requirements');
    requirementsList.innerHTML = '';
    details.requirements.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        requirementsList.appendChild(li);
    });
    
    // Set package details
    document.getElementById('package').textContent = details.package;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeJobModal() {
    const modal = document.getElementById('jobModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function applyForJob() {
    const company = document.getElementById('companyName').textContent;
    const position = document.getElementById('position').textContent;
    alert(`Thank you for your interest in the ${position} position at ${company}. The application system will be implemented soon.`);
    closeJobModal();
}

// Admission Modal Functions
function openAdmissionModal() {
    const modal = document.getElementById('admissionModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAdmissionModal() {
    const modal = document.getElementById('admissionModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Handle admission form
const admissionForm = document.getElementById('admissionForm');
if (admissionForm) {
    // File preview functionality
    const photoInput = document.getElementById('photo');
    const marksheetInput = document.getElementById('marksheet');

    photoInput.addEventListener('change', function(e) {
        validateFileSize(this, 2); // 2MB limit for photos
    });

    marksheetInput.addEventListener('change', function(e) {
        validateFileSize(this, 5); // 5MB limit for marksheets
    });

    // Form submission
    admissionForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const formData = new FormData(this);
            const response = await fetch('database/register_student.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                showApplicationSuccess(result.student_id);
                this.reset();
                closeAdmissionModal();
            } else {
                alert('Registration failed: ' + result.message);
            }
        } catch (error) {
            alert('An error occurred during registration. Please try again.');
            console.error('Registration error:', error);
        }
    });
}

// Aadhaar number validation and formatting
const aadhaarInput = document.getElementById('aadhaar');
if (aadhaarInput) {
    aadhaarInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Format with spaces for display (XXXX XXXX XXXX)
        if (value.length > 0) {
            value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
        }
        
        // Remove any extra spaces
        e.target.value = value.trim();
        
        // Validate length and format
        if (value.replace(/\s/g, '').length === 12) {
            this.classList.add('valid');
            this.classList.remove('invalid');
        } else if (value.length > 0) {
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            this.classList.remove('valid', 'invalid');
        }
    });
}

// Validation functions
function validateForm() {
    // Validate phone number
    const phone = document.getElementById('phone').value;
    if (!validatePhone(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return false;
    }

    // Validate email
    const email = document.getElementById('email').value;
    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return false;
    }

    // Validate date of birth
    const dob = new Date(document.getElementById('dob').value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 17) {
        alert('You must be at least 17 years old to apply');
        return false;
    }

    // Validate percentage
    const percentage = document.getElementById('percentage').value;
    if (percentage < 0 || percentage > 100) {
        alert('Please enter a valid percentage between 0 and 100');
        return false;
    }

    // Add Aadhaar validation
    const aadhaar = document.getElementById('aadhaar').value.replace(/\s/g, '');
    if (!/^\d{12}$/.test(aadhaar)) {
        alert('Please enter a valid 12-digit Aadhaar number');
        return false;
    }

    return true;
}

function validateFileSize(input, maxSizeMB) {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    if (input.files[0] && input.files[0].size > maxSize) {
        alert(`File size must be less than ${maxSizeMB}MB`);
        input.value = '';
        return false;
    }
    return true;
}

function validatePhone(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function generateApplicationNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `BCA${year}${random}`;
}

function showApplicationSuccess(applicationNumber) {
    const message = `
        Application submitted successfully!
        Your Application Number: ${applicationNumber}
        
        Please save this application number for future reference.
        You will receive a confirmation email shortly with further instructions.
    `;
    alert(message);
}

// Update window click handler to include admission modal
window.onclick = function(event) {
    const studentModal = document.getElementById('studentModal');
    const loginModal = document.getElementById('loginModal');
    const jobModal = document.getElementById('jobModal');
    const admissionModal = document.getElementById('admissionModal');
    
    if (event.target === studentModal) {
        closeStudentModal();
    } else if (event.target === loginModal) {
        closeLoginModal();
    } else if (event.target === jobModal) {
        closeJobModal();
    } else if (event.target === admissionModal) {
        closeAdmissionModal();
    }
}

// Add animation on scroll for course and feature cards
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.course-card, .feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease-out';
    observer.observe(card);
});

// Class Routine Tab Functionality
const tabButtons = document.querySelectorAll('.tab-btn');
const routineTables = document.querySelectorAll('.routine-table');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and tables
        tabButtons.forEach(btn => btn.classList.remove('active'));
        routineTables.forEach(table => table.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Show corresponding table
        const courseId = button.getAttribute('data-course');
        const targetTable = document.getElementById(`${courseId}-routine`);
        targetTable.classList.add('active');
    });
});

// Course and Batch Selection Logic
const courseBatchData = {
    'bca': {
        'morning': '8:00 AM - 11:00 AM',
        'afternoon': '12:00 PM - 3:00 PM',
        'evening': '4:00 PM - 7:00 PM'
    },
    'bca-ai': {
        'morning': '9:00 AM - 12:00 PM',
        'afternoon': '1:00 PM - 4:00 PM',
        'evening': '5:00 PM - 8:00 PM'
    },
    'bca-ds': {
        'morning': '8:30 AM - 11:30 AM',
        'afternoon': '12:30 PM - 3:30 PM',
        'evening': '4:30 PM - 7:30 PM'
    },
    'bca-cloud': {
        'morning': '9:30 AM - 12:30 PM',
        'afternoon': '1:30 PM - 4:30 PM',
        'evening': '5:30 PM - 8:30 PM'
    }
};

// Handle course selection and update batch timings
const courseSelect = document.getElementById('course');
const batchSelect = document.getElementById('batch');

if (courseSelect && batchSelect) {
    courseSelect.addEventListener('change', function() {
        const selectedCourse = this.value;
        batchSelect.innerHTML = '<option value="">Select Batch Timing</option>';
        
        if (selectedCourse) {
            // Enable batch selection
            batchSelect.disabled = false;
            
            // Add batch options for selected course
            const batchTimes = courseBatchData[selectedCourse];
            for (const [key, time] of Object.entries(batchTimes)) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = time;
                batchSelect.appendChild(option);
            }
            
            // Add visual indication that batch can be selected
            batchSelect.classList.add('active');
        } else {
            // Disable batch selection if no course is selected
            batchSelect.disabled = true;
            batchSelect.innerHTML = '<option value="">First select a course</option>';
            batchSelect.classList.remove('active');
        }
    });
}

// Teacher Registration Modal Functions
function openTeacherRegistrationModal() {
    closeLoginModal(); // Close login modal first
    const modal = document.getElementById('teacherRegistrationModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeTeacherRegistrationModal() {
    const modal = document.getElementById('teacherRegistrationModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Reset teacher registration form
function resetTeacherForm() {
    document.getElementById('teacherRegistrationForm').reset();
}

// Handle teacher registration form submission
const teacherRegistrationForm = document.getElementById('teacherRegistrationForm');
if (teacherRegistrationForm) {
    teacherRegistrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateTeacherForm()) {
            return;
        }

        try {
            const formData = new FormData(this);
            const response = await fetch('database/register_teacher.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                showTeacherRegistrationSuccess(result.teacher_id);
                resetTeacherForm();
                closeTeacherRegistrationModal();
            } else {
                alert('Registration failed: ' + result.message);
            }
        } catch (error) {
            alert('An error occurred during registration. Please try again.');
            console.error('Registration error:', error);
        }
    });
}

// Validate teacher registration form
function validateTeacherForm() {
    // Validate password match
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return false;
    }

    // Validate password strength
    if (!validatePasswordStrength(password)) {
        alert('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        return false;
    }

    // Validate phone number
    const phone = document.getElementById('teacherPhone').value;
    if (!validatePhone(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return false;
    }

    // Validate email
    const email = document.getElementById('teacherEmail').value;
    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return false;
    }

    // Validate file sizes
    const resume = document.getElementById('resume').files[0];
    const certificate = document.getElementById('certificate').files[0];
    
    if (!validateFileSize(resume, 5)) { // 5MB limit for resume
        alert('Resume file size must be less than 5MB');
        return false;
    }

    if (!validateFileSize(certificate, 5)) { // 5MB limit for certificate
        alert('Certificate file size must be less than 5MB');
        return false;
    }

    return true;
}

// Generate unique teacher ID
function generateTeacherId() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TCH${year}${random}`;
}

// Validate password strength
function validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
}

// Show registration success message
function showTeacherRegistrationSuccess(teacherId) {
    const message = `
        Registration successful!
        Your Teacher ID: ${teacherId}
        
        Please save this ID for login.
        You will receive a confirmation email shortly.
    `;
    alert(message);
}

// Update window click handler to include teacher registration modal
window.onclick = function(event) {
    const studentModal = document.getElementById('studentModal');
    const loginModal = document.getElementById('loginModal');
    const jobModal = document.getElementById('jobModal');
    const admissionModal = document.getElementById('admissionModal');
    const teacherRegistrationModal = document.getElementById('teacherRegistrationModal');
    
    if (event.target === studentModal) {
        closeStudentModal();
    } else if (event.target === loginModal) {
        closeLoginModal();
    } else if (event.target === jobModal) {
        closeJobModal();
    } else if (event.target === admissionModal) {
        closeAdmissionModal();
    } else if (event.target === teacherRegistrationModal) {
        closeTeacherRegistrationModal();
    }
}

// Student Dashboard Functions
async function updateDashboard() {
    if (!isLoggedIn()) return;

    try {
        // Update student info
        const studentName = localStorage.getItem('studentName');
        document.getElementById('studentNameDisplay').textContent = studentName;

        // Update exam counts
        await updateExamCounts();

        // Update course info
        updateCourseInfo();

        // Update attendance info
        updateAttendanceInfo();

        // Update upcoming classes
        updateUpcomingClasses();
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

// Update exam counts
async function updateExamCounts() {
    try {
        const response = await fetch('api/get_exam_counts.php');
        const data = await response.json();
        
        // Update exam counts
        document.getElementById('availableExamsCount').textContent = data.available || 0;
        document.getElementById('completedExamsCount').textContent = data.completed || 0;

        // Update notification badge
        const notificationBadge = document.getElementById('examNotification');
        if (data.available > 0) {
            notificationBadge.textContent = `${data.available} New`;
            notificationBadge.classList.add('active');
        } else {
            notificationBadge.textContent = '';
            notificationBadge.classList.remove('active');
        }

        // Add pulse animation if there are available exams
        const examButton = document.querySelector('.exam-portal-btn');
        if (data.available > 0) {
            examButton.classList.add('pulse');
        } else {
            examButton.classList.remove('pulse');
        }

        // Update next exam information
        if (data.nextExam) {
            const examDate = new Date(data.nextExam.start_time);
            const formattedDate = examDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = examDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            document.getElementById('nextExamDetails').innerHTML = `
                <strong>${data.nextExam.subject_name}</strong><br>
                ${formattedDate} at ${formattedTime}<br>
                Duration: ${data.nextExam.duration_minutes} minutes
            `;
        } else {
            document.getElementById('nextExamDetails').textContent = 'No upcoming exams';
        }

    } catch (error) {
        console.error('Error fetching exam counts:', error);
        showError('Failed to update exam information');
    }
}

// Open exam portal with animation
function openExamPortal() {
    if (!isLoggedIn()) {
        showLoginModal();
        return;
    }

    // Add click animation
    const button = document.querySelector('.exam-portal-btn');
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 100);

    // Save current page state
    localStorage.setItem('lastPage', window.location.href);
    
    // Redirect to exam portal with slight delay for animation
    setTimeout(() => {
        window.location.href = 'exam_portal.html';
    }, 200);
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${message}
    `;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Auto-update exam information every 5 minutes
setInterval(updateExamCounts, 300000);

// Check login status
function isLoggedIn() {
    return localStorage.getItem('studentId') !== null;
}

// BCA First Semester Exam Functions
async function updateBCAExamInfo() {
    try {
        const response = await fetch('api/get_bca_exam_info.php');
        const data = await response.json();

        // Update next exam info
        const nextExamElement = document.getElementById('nextBCAExam');
        if (data.nextExam) {
            const examDate = new Date(data.nextExam.start_time);
            const today = new Date();
            let displayText = '';

            if (examDate.toDateString() === today.toDateString()) {
                displayText = `Today at ${examDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}`;
            } else if (examDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) {
                displayText = `${examDate.toLocaleDateString('en-US', { weekday: 'long' })} at ${examDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}`;
            } else {
                displayText = examDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            nextExamElement.textContent = `${data.nextExam.subject_name} - ${displayText}`;
            nextExamElement.classList.remove('loading');
        } else {
            nextExamElement.textContent = 'No upcoming exams';
            nextExamElement.classList.remove('loading');
        }

        // Update upcoming tests count
        document.getElementById('upcomingBCATests').textContent = data.upcomingCount || 0;

        // Update notification badge
        const notificationBadge = document.getElementById('bcaExamNotification');
        if (data.activeExam) {
            notificationBadge.textContent = 'LIVE';
            notificationBadge.classList.add('active');
            startExamNotificationPulse();
        } else {
            notificationBadge.classList.remove('active');
        }

        // Update subject items
        data.subjects.forEach(subject => {
            const subjectElement = document.querySelector(`[data-subject="${subject.code}"]`);
            if (subjectElement) {
                subjectElement.classList.toggle('has-exam', subject.hasExam);
            }
        });

    } catch (error) {
        console.error('Error updating BCA exam info:', error);
        showError('Failed to update exam information');
    }
}

// Start exam notification pulse animation
function startExamNotificationPulse() {
    const button = document.querySelector('.bca-exam-btn');
    button.classList.add('pulse');
}

// View BCA exam schedule
function viewBCASchedule() {
    if (!isLoggedIn()) {
        showLoginModal();
        return;
    }

    // Add button click animation
    const button = document.querySelector('.schedule-btn');
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 200);

    // Show schedule modal
    showBCAScheduleModal();
}

// Open BCA exam portal
function openBCAExamPortal() {
    if (!isLoggedIn()) {
        showLoginModal();
        return;
    }

    // Add button click animation
    const button = document.querySelector('.bca-exam-btn');
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 200);

    // Check if there's an active exam
    fetch('api/check_active_exam.php')
        .then(response => response.json())
        .then(data => {
            if (data.activeExam) {
                window.location.href = 'exam_portal.html?exam=' + data.activeExam.id;
            } else {
                showMessage('No active exams at the moment. Please check the schedule.');
            }
        })
        .catch(error => {
            console.error('Error checking active exam:', error);
            showError('Failed to check exam status');
        });
}

// Show BCA schedule modal
function showBCAScheduleModal() {
    // Implementation for schedule modal
    // This will be implemented when we create the schedule modal
}

// Show message to user
function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-popup';
    messageDiv.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Initialize BCA exam portal
document.addEventListener('DOMContentLoaded', function() {
    updateBCAExamInfo();
    // Update exam info every 2 minutes
    setInterval(updateBCAExamInfo, 120000);
});
