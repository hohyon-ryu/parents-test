let currentQuestion = 0;
let answers = [];
let chart = null;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const progressEl = document.getElementById("progress");
const resultContainerEl = document.getElementById("result-container");
const resultTypeEl = document.getElementById("result-type");
const resultDescriptionEl = document.getElementById("result-description");
const resultExplanationEl = document.getElementById("result-explanation");
const restartBtnEl = document.getElementById("restart-btn");
const chartEl = document.getElementById("radar-chart");

function loadQuestion() {
  const question = parentingQuizData[currentQuestion];
  questionEl.textContent = question.question;
  optionsEl.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option.text;
    button.classList.add("fade-in");
    button.style.animationDelay = `${index * 0.1}s`;
    button.addEventListener("click", () => selectOption(option.type));
    optionsEl.appendChild(button);
  });

  questionEl.classList.add("fade-in");
  updateProgress();
}

function selectOption(type) {
  answers.push(type);
  currentQuestion++;

  if (currentQuestion < parentingQuizData.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function updateProgress() {
  const progress = ((currentQuestion + 1) / parentingQuizData.length) * 100;
  progressEl.style.width = `${progress}%`;
}

function showResult() {
  const result = calculateResult();
  const counts = countAnswers();
  document.querySelector(".quiz-container > h1").style.display = "none";
  document.getElementById("question-container").style.display = "none";
  document.getElementById("progress-bar").style.display = "none";
  resultContainerEl.style.display = "block";

  setTimeout(() => {
    resultContainerEl.classList.add("show");
    resultTypeEl.textContent = result;
    resultDescriptionEl.textContent = resultDescriptions[result];
    drawRadarChart(counts);
    showTextExplanation(counts);
  }, 100);
}

function calculateResult() {
  const counts = countAnswers();
  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
}

function countAnswers() {
  return answers.reduce(
    (acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    { A: 0, B: 0, C: 0, D: 0 }
  );
}

function drawRadarChart(counts) {
  if (chart) {
    chart.destroy();
  }

  const ctx = chartEl.getContext("2d");
  chart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["A", "B", "C", "D"],
      datasets: [
        {
          label: "부모 유형",
          data: [counts.A, counts.B, counts.C, counts.D],
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          borderColor: "rgba(52, 152, 219, 1)",
          pointBackgroundColor: "rgba(52, 152, 219, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(52, 152, 219, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            display: false,
          },
          suggestedMin: 0,
          suggestedMax: Math.max(...Object.values(counts)),
        },
      },
    },
  });
}

function showTextExplanation(counts) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const percentages = Object.entries(counts).map(([type, count]) => ({
    type,
    percentage: Math.round((count / total) * 100),
  }));

  percentages.sort((a, b) => b.percentage - a.percentage);

  let explanationHTML = "<h3>당신의 양육 스타일 분석</h3>";
  explanationHTML += "<ul>";

  percentages.forEach(({ type, percentage }) => {
    const description = resultDescriptions[type].split(":"); // Split the description into title and content
    explanationHTML += `<li><strong>${description[0]}</strong>: ${percentage}%<br>${description[1]}</li>`;
  });

  explanationHTML += "</ul>";
  explanationHTML +=
    "<p>이 결과는 당신의 주된 양육 스타일을 보여주지만, 실제로는 다양한 상황에 따라 여러 스타일을 혼합하여 사용할 수 있습니다. 각 스타일의 장점을 이해하고 자녀의 needs에 맞게 유연하게 적용하는 것이 중요합니다.</p>";

  resultExplanationEl.innerHTML = explanationHTML;
}

function restartQuiz() {
  currentQuestion = 0;
  answers = [];
  document.querySelector(".quiz-container > h1").style.display = "block";
  document.getElementById("question-container").style.display = "block";
  document.getElementById("progress-bar").style.display = "block";
  resultContainerEl.style.display = "none";
  resultContainerEl.classList.remove("show");
  if (chart) {
    chart.destroy();
  }
  loadQuestion();
}

restartBtnEl.addEventListener("click", restartQuiz);

loadQuestion();
