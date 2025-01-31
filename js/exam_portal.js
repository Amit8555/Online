// Global variables
let currentExam = null;
let currentQuestion = 0;
let examQuestions = [];
let userAnswers = {};
let examTimer = null;
let timeLeft = 0;

// Initialize exam portal
document.addEventListener('DOMContentLoaded', function() {
    loadExams();
    updateStudentInfo();
});

// Load available exams
async function loadExams() {
    try {
        const response = await fetch('api/get_available_exams.php');
        const exams = await response.json();
        displayExams(exams);
    } catch (error) {
        console.error('Error loading exams:', error);
        showError('Failed to load exams. Please try again later.');
    }
}

// Display exams in the list
function displayExams(exams) {
    const examList = document.getElementById('examList');
    examList.innerHTML = '';

    exams.forEach(exam => {
        const examCard = document.createElement('div');
        examCard.className = 'exam-card';
        examCard.innerHTML = `
            <div class="exam-info">
                <h3>${exam.exam_title}</h3>
                <p>${exam.subject_name}</p>
                <div class="exam-meta">
                    <span>Duration: ${exam.duration_minutes} mins</span>
                    <span>Total Marks: ${exam.total_marks}</span>
                </div>
            </div>
            <button onclick="startExamProcess('${exam.exam_code}')" 
                    class="primary-btn">Start Exam</button>
        `;
        examList.appendChild(examCard);
    });
}

// Start exam process
async function startExamProcess(examCode) {
    try {
        const response = await fetch(`api/get_exam_details.php?exam_code=${examCode}`);
        const examDetails = await response.json();
        
        currentExam = examDetails;
        displayExamInstructions(examDetails);
    } catch (error) {
        console.error('Error getting exam details:', error);
        showError('Failed to load exam details. Please try again.');
    }
}

// Display exam instructions
function displayExamInstructions(exam) {
    document.getElementById('examTitle').textContent = exam.exam_title;
    document.getElementById('examDescription').textContent = exam.description;
    document.getElementById('examDuration').textContent = exam.duration_minutes;
    document.getElementById('examMarks').textContent = exam.total_marks;
    document.getElementById('examPassing').textContent = exam.passing_percentage;

    hideAllSections();
    document.getElementById('examInstructionsView').classList.remove('hidden');
}

// Start the exam
async function startExam() {
    try {
        const response = await fetch(`api/start_exam.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                exam_code: currentExam.exam_code
            })
        });
        
        const result = await response.json();
        if (result.success) {
            examQuestions = result.questions;
            initializeExam();
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error starting exam:', error);
        showError('Failed to start exam. Please try again.');
    }
}

// Initialize exam view
function initializeExam() {
    hideAllSections();
    document.getElementById('examQuestionView').classList.remove('hidden');
    
    // Initialize timer
    timeLeft = currentExam.duration_minutes * 60;
    startTimer();
    
    // Create question navigation
    createQuestionNavigation();
    
    // Load first question
    loadQuestion(0);
}

// Create question navigation buttons
function createQuestionNavigation() {
    const container = document.getElementById('questionNumbers');
    container.innerHTML = '';
    
    examQuestions.forEach((_, index) => {
        const button = document.createElement('div');
        button.className = 'question-number';
        button.textContent = index + 1;
        button.onclick = () => loadQuestion(index);
        container.appendChild(button);
    });
}

// Load question
function loadQuestion(index) {
    const question = examQuestions[index];
    currentQuestion = index;
    
    document.getElementById('currentQuestionNum').textContent = index + 1;
    document.getElementById('totalQuestions').textContent = examQuestions.length;
    document.getElementById('questionMarks').textContent = question.marks;
    document.getElementById('questionText').textContent = question.question_text;
    
    document.getElementById('optionAText').textContent = question.option_a;
    document.getElementById('optionBText').textContent = question.option_b;
    document.getElementById('optionCText').textContent = question.option_c;
    document.getElementById('optionDText').textContent = question.option_d;
    
    // Clear previous selection
    document.querySelectorAll('input[name="answer"]').forEach(input => {
        input.checked = false;
    });
    
    // Set saved answer if exists
    if (userAnswers[index]) {
        document.getElementById(`option${userAnswers[index]}`).checked = true;
    }
    
    updateNavigationButtons();
    updateQuestionStatus();
}

// Update navigation buttons
function updateNavigationButtons() {
    document.getElementById('prevBtn').disabled = currentQuestion === 0;
    document.getElementById('nextBtn').disabled = currentQuestion === examQuestions.length - 1;
    document.getElementById('submitBtn').classList.toggle('hidden', currentQuestion !== examQuestions.length - 1);
}

// Update question status in navigation
function updateQuestionStatus() {
    const questionButtons = document.querySelectorAll('.question-number');
    questionButtons.forEach((button, index) => {
        button.classList.toggle('current', index === currentQuestion);
        button.classList.toggle('answered', userAnswers[index] !== undefined);
        button.classList.toggle('marked', isQuestionMarked(index));
    });
}

// Save answer
function saveAnswer() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        userAnswers[currentQuestion] = selectedAnswer.value;
        updateQuestionStatus();
    }
}

// Navigation functions
function nextQuestion() {
    saveAnswer();
    if (currentQuestion < examQuestions.length - 1) {
        loadQuestion(currentQuestion + 1);
    }
}

function previousQuestion() {
    saveAnswer();
    if (currentQuestion > 0) {
        loadQuestion(currentQuestion - 1);
    }
}

// Mark question for review
function markForReview() {
    const questionBtn = document.querySelectorAll('.question-number')[currentQuestion];
    questionBtn.classList.toggle('marked');
}

// Timer functions
function startTimer() {
    examTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(examTimer);
            submitExam(true);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('examTimer').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Submit exam
async function submitExam(isAutoSubmit = false) {
    if (!isAutoSubmit) {
        const confirmed = confirm('Are you sure you want to submit the exam?');
        if (!confirmed) return;
    }
    
    clearInterval(examTimer);
    
    try {
        const response = await fetch('api/submit_exam.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                exam_code: currentExam.exam_code,
                answers: userAnswers,
                time_taken: (currentExam.duration_minutes * 60) - timeLeft
            })
        });
        
        const result = await response.json();
        if (result.success) {
            showResults(result.results);
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error submitting exam:', error);
        showError('Failed to submit exam. Please try again.');
    }
}

// Show results
function showResults(results) {
    hideAllSections();
    document.getElementById('resultView').classList.remove('hidden');
    
    document.getElementById('scoreObtained').textContent = results.score_obtained;
    document.getElementById('totalScore').textContent = results.total_score;
    document.getElementById('scorePercentage').textContent = `${results.percentage}%`;
    document.getElementById('correctAnswers').textContent = results.correct_answers;
    document.getElementById('wrongAnswers').textContent = results.wrong_answers;
    document.getElementById('questionsAttempted').textContent = results.questions_attempted;
    document.getElementById('timeTaken').textContent = formatTime(results.time_taken);
    
    const resultStatus = document.getElementById('resultStatus');
    resultStatus.textContent = results.passed ? 'PASSED' : 'FAILED';
    resultStatus.className = `result-status ${results.passed ? 'pass' : 'fail'}`;
}

// Utility functions
function hideAllSections() {
    document.querySelectorAll('.portal-section').forEach(section => {
        section.classList.add('hidden');
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

function showError(message) {
    alert(message);
}

function isQuestionMarked(index) {
    const questionBtn = document.querySelectorAll('.question-number')[index];
    return questionBtn.classList.contains('marked');
}

function updateStudentInfo() {
    // Get student info from session/localStorage
    const studentName = localStorage.getItem('studentName') || 'Student';
    document.getElementById('studentName').textContent = studentName;
}

function returnToDashboard() {
    window.location.href = 'student_dashboard.html';
}

// View answers
function viewAnswers() {
    // Implement answer review functionality
    alert('Answer review feature will be implemented soon.');
}
