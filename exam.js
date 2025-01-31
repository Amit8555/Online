// Exam State
let examState = {
    currentQuestion: 1,
    totalQuestions: 0,
    timeRemaining: 0,
    answers: {},
    markedForReview: new Set(),
    examId: null,
    examData: null,
    timer: null
};

// Initialize exam
async function initializeExam() {
    try {
        // Get exam ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const examId = urlParams.get('exam');
        
        if (!examId) {
            showError('Invalid exam ID');
            return;
        }

        examState.examId = examId;

        // Fetch exam data
        const response = await fetch(`api/get_exam_data.php?exam_id=${examId}`);
        const data = await response.json();

        if (!data.success) {
            showError(data.message || 'Failed to load exam');
            return;
        }

        examState.examData = data;
        examState.totalQuestions = data.questions.length;
        examState.timeRemaining = data.duration_minutes * 60;

        // Initialize UI
        updateExamInfo();
        loadQuestion(1);
        initializeQuestionGrid();
        startTimer();
        updateStudentInfo();

    } catch (error) {
        console.error('Error initializing exam:', error);
        showError('Failed to initialize exam');
    }
}

// Update exam information
function updateExamInfo() {
    const { examData } = examState;
    document.getElementById('examTitle').textContent = examData.title;
    document.getElementById('subjectCode').textContent = examData.subject_code;
    document.getElementById('examDate').textContent = new Date(examData.start_time).toLocaleDateString();
}

// Load question
function loadQuestion(questionNumber) {
    const question = examState.examData.questions[questionNumber - 1];
    examState.currentQuestion = questionNumber;

    // Update question content
    document.getElementById('currentQuestionNo').textContent = questionNumber;
    document.getElementById('questionMarks').textContent = question.marks;
    document.getElementById('questionContent').innerHTML = question.question_text;

    // Load options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        if (examState.answers[questionNumber] === index) {
            optionElement.classList.add('selected');
        }
        optionElement.onclick = () => selectOption(questionNumber, index);
        optionElement.innerHTML = `
            <span class="option-label">${String.fromCharCode(65 + index)}.</span>
            <span class="option-text">${option}</span>
        `;
        optionsContainer.appendChild(optionElement);
    });

    // Update question grid
    updateQuestionStatus();
}

// Initialize question grid
function initializeQuestionGrid() {
    const grid = document.getElementById('questionGrid');
    grid.innerHTML = '';

    for (let i = 1; i <= examState.totalQuestions; i++) {
        const questionButton = document.createElement('div');
        questionButton.className = 'question-number';
        questionButton.textContent = i;
        questionButton.onclick = () => loadQuestion(i);
        grid.appendChild(questionButton);
    }

    updateQuestionStatus();
    updateProgress();
}

// Update question status
function updateQuestionStatus() {
    const buttons = document.querySelectorAll('.question-number');
    buttons.forEach((button, index) => {
        const questionNumber = index + 1;
        button.className = 'question-number';
        
        if (questionNumber === examState.currentQuestion) {
            button.classList.add('current');
        } else if (examState.answers[questionNumber] !== undefined) {
            button.classList.add('answered');
        }
        
        if (examState.markedForReview.has(questionNumber)) {
            button.classList.add('marked');
        }
    });
}

// Select option
function selectOption(questionNumber, optionIndex) {
    examState.answers[questionNumber] = optionIndex;
    
    // Update UI
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        option.classList.toggle('selected', index === optionIndex);
    });

    updateQuestionStatus();
    updateProgress();
}

// Update progress
function updateProgress() {
    const attempted = Object.keys(examState.answers).length;
    const marked = examState.markedForReview.size;

    document.getElementById('attemptedCount').textContent = `${attempted}/${examState.totalQuestions}`;
    document.getElementById('reviewCount').textContent = marked;
}

// Timer functions
function startTimer() {
    updateTimerDisplay();
    examState.timer = setInterval(() => {
        examState.timeRemaining--;
        updateTimerDisplay();

        if (examState.timeRemaining <= 0) {
            clearInterval(examState.timer);
            submitExam(true);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(examState.timeRemaining / 3600);
    const minutes = Math.floor((examState.timeRemaining % 3600) / 60);
    const seconds = examState.timeRemaining % 60;

    document.getElementById('timeRemaining').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Add warning class if less than 5 minutes remaining
    if (examState.timeRemaining < 300) {
        document.getElementById('timeRemaining').classList.add('warning');
    }
}

// Navigation functions
function previousQuestion() {
    if (examState.currentQuestion > 1) {
        loadQuestion(examState.currentQuestion - 1);
    }
}

function saveAndNext() {
    if (examState.currentQuestion < examState.totalQuestions) {
        loadQuestion(examState.currentQuestion + 1);
    }
}

function markForReview() {
    const questionNumber = examState.currentQuestion;
    if (examState.markedForReview.has(questionNumber)) {
        examState.markedForReview.delete(questionNumber);
    } else {
        examState.markedForReview.add(questionNumber);
    }
    updateQuestionStatus();
    updateProgress();
}

function clearResponse() {
    const questionNumber = examState.currentQuestion;
    delete examState.answers[questionNumber];
    
    // Update UI
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));

    updateQuestionStatus();
    updateProgress();
}

// Submit functions
function confirmSubmit() {
    const modal = document.getElementById('submitModal');
    
    // Update submission summary
    document.getElementById('totalQuestions').textContent = examState.totalQuestions;
    document.getElementById('totalAttempted').textContent = Object.keys(examState.answers).length;
    document.getElementById('totalMarked').textContent = examState.markedForReview.size;

    modal.classList.add('active');
}

function closeSubmitModal() {
    document.getElementById('submitModal').classList.remove('active');
}

async function submitExam(isAutoSubmit = false) {
    try {
        const response = await fetch('api/submit_exam.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                examId: examState.examId,
                answers: examState.answers,
                timeSpent: examState.examData.duration_minutes * 60 - examState.timeRemaining,
                isAutoSubmit
            })
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = `result.html?exam=${examState.examId}`;
        } else {
            showError(data.message || 'Failed to submit exam');
        }

    } catch (error) {
        console.error('Error submitting exam:', error);
        showError('Failed to submit exam');
    }
}

// Show instructions
function showInstructions() {
    // Implementation for showing instructions modal
    // This will be implemented when we create the instructions modal
}

// Update student info
function updateStudentInfo() {
    const studentName = localStorage.getItem('studentName');
    const rollNumber = localStorage.getItem('studentId');

    document.getElementById('studentName').textContent = studentName || 'Student';
    document.getElementById('rollNumber').textContent = rollNumber || '';
}

// Error handling
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

// Initialize exam when page loads
document.addEventListener('DOMContentLoaded', initializeExam);
