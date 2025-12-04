// Environmental Quiz Game
const quizQuestions = [
    {
        question: "¿Cuántos años tarda una botella de plástico en descomponerse?",
        options: ["10 años", "100 años", "450 años", "1000 años"],
        correct: 2,
        explanation: "Una botella de plástico puede tardar hasta 450 años en descomponerse completamente."
    },
    {
        question: "¿Cuál es el gas principal responsable del efecto invernadero?",
        options: ["Oxígeno", "Nitrógeno", "Dióxido de carbono", "Hidrógeno"],
        correct: 2,
        explanation: "El CO2 (dióxido de carbono) es el principal gas de efecto invernadero producido por actividades humanas."
    },
    {
        question: "¿Qué porcentaje del agua en la Tierra es dulce y accesible?",
        options: ["50%", "25%", "10%", "Menos del 1%"],
        correct: 3,
        explanation: "Solo menos del 1% del agua del planeta es dulce y accesible para consumo humano."
    },
    {
        question: "¿Cuántos árboles se necesitan para absorber el CO2 de un auto promedio al año?",
        options: ["1 árbol", "5 árboles", "50 árboles", "200 árboles"],
        correct: 2,
        explanation: "Se necesitan aproximadamente 50 árboles para absorber las emisiones anuales de un auto."
    },
    {
        question: "¿Cuál acción ahorra más agua?",
        options: ["Cerrar el grifo al cepillarte", "Duchas cortas", "Reparar fugas", "Todas ahorran igual"],
        correct: 2,
        explanation: "Reparar fugas puede ahorrar hasta 11,000 litros de agua al año."
    },
    {
        question: "¿Qué material es 100% reciclable infinitamente?",
        options: ["Plástico", "Papel", "Vidrio", "Cartón"],
        correct: 2,
        explanation: "El vidrio puede reciclarse infinitas veces sin perder calidad."
    },
    {
        question: "¿Cuánto tarda una colilla de cigarro en degradarse?",
        options: ["6 meses", "1-2 años", "10-12 años", "50 años"],
        correct: 2,
        explanation: "Una colilla de cigarro tarda entre 10 y 12 años en descomponerse."
    },
    {
        question: "¿Qué porcentaje de los residuos del hogar pueden reciclarse?",
        options: ["20%", "40%", "60%", "75%"],
        correct: 3,
        explanation: "Aproximadamente el 75% de los residuos domésticos son reciclables."
    }
];

// Recycling Game Items - Names don't match bin categories
const recyclingItems = [
    { name: "Envase de agua mineral", icon: "🍾", bin: "plastico", correct: "amarillo" },
    { name: "Diario de ayer", icon: "📰", bin: "papel", correct: "azul" },
    { name: "Lata de atún vacía", icon: "🥫", bin: "plastico", correct: "amarillo" },
    { name: "Frasco de salsa", icon: "🫙", bin: "vidrio", correct: "verde" },
    { name: "Cáscara de naranja", icon: "🍊", bin: "organico", correct: "marron" },
    { name: "Caja de cereal", icon: "📦", bin: "papel", correct: "azul" },
    { name: "Bote de champú", icon: "🧴", bin: "plastico", correct: "amarillo" },
    { name: "Restos de ensalada", icon: "🥗", bin: "organico", correct: "marron" },
    { name: "Folleto publicitario", icon: "📄", bin: "papel", correct: "azul" },
    { name: "Tarro de mermelada", icon: "🍯", bin: "vidrio", correct: "verde" },
    { name: "Bolsa de snacks", icon: "🍿", bin: "plastico", correct: "amarillo" },
    { name: "Hueso de pollo", icon: "🍗", bin: "organico", correct: "marron" },
    { name: "Tubo de pasta dental", icon: "🪥", bin: "plastico", correct: "amarillo" },
    { name: "Sobre de carta", icon: "✉️", bin: "papel", correct: "azul" }
];

// Water Saving Tips
const waterTips = [
    {
        tip: "Cierra el grifo mientras te cepillas los dientes",
        savings: "12 litros por minuto",
        icon: "🪥"
    },
    {
        tip: "Toma duchas de 5 minutos en lugar de 10",
        savings: "100 litros por ducha",
        icon: "🚿"
    },
    {
        tip: "Usa la lavadora solo con carga completa",
        savings: "50 litros por lavado",
        icon: "👕"
    },
    {
        tip: "Repara los grifos que gotean",
        savings: "30 litros por día",
        icon: "🔧"
    },
    {
        tip: "Riega las plantas temprano en la mañana",
        savings: "25% menos evaporación",
        icon: "🌱"
    },
    {
        tip: "Reutiliza el agua de cocinar verduras",
        savings: "5 litros por día",
        icon: "🥕"
    }
];

let currentQuizQuestion = 0;
let quizScore = 0;
let recyclingScore = 0;
let currentRecyclingItem = null;
let waterTipIndex = 0;

// Quiz Functions
function startQuiz() {
    currentQuizQuestion = 0;
    quizScore = 0;
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('quizResult').style.display = 'none';
    showQuestion();
}

function showQuestion() {
    const q = quizQuestions[currentQuizQuestion];
    const container = document.getElementById('quizQuestion');

    container.innerHTML = `
        <div class="quiz-progress">Pregunta ${currentQuizQuestion + 1} de ${quizQuestions.length}</div>
        <h3>${q.question}</h3>
        <div class="quiz-options">
            ${q.options.map((opt, i) => `
                <button class="quiz-option" onclick="checkAnswer(${i})">${opt}</button>
            `).join('')}
        </div>
    `;
}

function checkAnswer(selected) {
    const q = quizQuestions[currentQuizQuestion];
    const buttons = document.querySelectorAll('.quiz-option');

    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.correct) {
            btn.classList.add('correct');
        } else if (i === selected) {
            btn.classList.add('incorrect');
        }
    });

    if (selected === q.correct) {
        quizScore++;
    }

    // Show explanation
    const container = document.getElementById('quizQuestion');
    container.innerHTML += `<div class="quiz-explanation">${q.explanation}</div>`;

    setTimeout(() => {
        currentQuizQuestion++;
        if (currentQuizQuestion < quizQuestions.length) {
            showQuestion();
        } else {
            showQuizResult();
        }
    }, 2500);
}

function showQuizResult() {
    document.getElementById('quizContainer').style.display = 'none';
    const resultDiv = document.getElementById('quizResult');
    resultDiv.style.display = 'block';

    const percentage = Math.round((quizScore / quizQuestions.length) * 100);
    let message = '';
    let emoji = '';

    if (percentage >= 80) {
        message = '¡Excelente! Eres un experto ambiental.';
        emoji = '🌟';
    } else if (percentage >= 60) {
        message = '¡Muy bien! Conoces bastante sobre el medio ambiente.';
        emoji = '👍';
    } else if (percentage >= 40) {
        message = 'Buen intento. ¡Sigue aprendiendo!';
        emoji = '📚';
    } else {
        message = 'Hay mucho por aprender. ¡No te rindas!';
        emoji = '💪';
    }

    resultDiv.innerHTML = `
        <div class="result-emoji">${emoji}</div>
        <h3>Tu puntuación: ${quizScore}/${quizQuestions.length}</h3>
        <div class="result-bar">
            <div class="result-fill" style="width: ${percentage}%"></div>
        </div>
        <p>${message}</p>
        <button class="btn-play" onclick="startQuiz()">Jugar de nuevo</button>
    `;
}

// Recycling Game Functions
function startRecycling() {
    recyclingScore = 0;
    document.getElementById('recyclingScore').textContent = '0';
    document.getElementById('recyclingContainer').style.display = 'block';
    nextRecyclingItem();
}

function nextRecyclingItem() {
    const availableItems = recyclingItems.filter(item => !item.used);
    if (availableItems.length === 0) {
        // Reset all items
        recyclingItems.forEach(item => item.used = false);
    }

    const randomIndex = Math.floor(Math.random() * recyclingItems.length);
    currentRecyclingItem = recyclingItems[randomIndex];

    document.getElementById('recyclingItem').innerHTML = `
        <div class="recycle-item-display">
            <span class="item-icon">${currentRecyclingItem.icon}</span>
            <span class="item-name">${currentRecyclingItem.name}</span>
        </div>
        <p>¿En qué contenedor va?</p>
    `;
}

function selectBin(color) {
    const feedback = document.getElementById('recyclingFeedback');

    if (color === currentRecyclingItem.correct) {
        recyclingScore++;
        document.getElementById('recyclingScore').textContent = recyclingScore;
        feedback.innerHTML = '<span class="correct-feedback">✓ ¡Correcto!</span>';
        feedback.className = 'feedback correct';
    } else {
        feedback.innerHTML = `<span class="incorrect-feedback">✗ Incorrecto. Va en el contenedor ${currentRecyclingItem.correct}</span>`;
        feedback.className = 'feedback incorrect';
    }

    feedback.style.display = 'block';

    setTimeout(() => {
        feedback.style.display = 'none';
        nextRecyclingItem();
    }, 1500);
}

// Water Tips Functions
function showWaterTips() {
    document.getElementById('waterContainer').style.display = 'block';
    waterTipIndex = 0;
    showCurrentTip();
}

function showCurrentTip() {
    const tip = waterTips[waterTipIndex];
    document.getElementById('waterTipContent').innerHTML = `
        <div class="water-tip-icon">${tip.icon}</div>
        <h3>${tip.tip}</h3>
        <p class="water-savings">Ahorro: ${tip.savings}</p>
        <div class="tip-counter">${waterTipIndex + 1} / ${waterTips.length}</div>
    `;
}

function nextTip() {
    waterTipIndex = (waterTipIndex + 1) % waterTips.length;
    showCurrentTip();
}

function prevTip() {
    waterTipIndex = (waterTipIndex - 1 + waterTips.length) % waterTips.length;
    showCurrentTip();
}

// Modal Functions
function openGame(gameType) {
    document.getElementById('gameModal').style.display = 'flex';

    // Hide all game containers
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('recyclingContainer').style.display = 'none';
    document.getElementById('waterContainer').style.display = 'none';

    if (gameType === 'quiz') {
        document.getElementById('modalTitle').textContent = 'Quiz Ambiental';
        startQuiz();
    } else if (gameType === 'recycling') {
        document.getElementById('modalTitle').textContent = 'Clasificador de Reciclaje';
        startRecycling();
    } else if (gameType === 'water') {
        document.getElementById('modalTitle').textContent = 'Tips para Ahorrar Agua';
        showWaterTips();
    }
}

function closeGameModal() {
    document.getElementById('gameModal').style.display = 'none';
}

// Close modal when clicking outside
document.addEventListener('click', function (e) {
    const modal = document.getElementById('gameModal');
    if (e.target === modal) {
        closeGameModal();
    }
});
