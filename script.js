let currentExam = null;
let filteredQuestions = [];
let currentQuestion = 0;
let correctCount = 0;

window.onload = function () {
  showScreen('examSelect');
};

// ======================
// FURIGANA
// ======================
function convertFurigana(text) {
  return text.replace(
    /([一-龯々〆ヵヶ]+)\(([\u3040-\u30FF]+)\)/g,
    '<ruby>$1<rt>$2</rt></ruby>',
  );
}
// ======================
// SHOW SCREEN
// ======================
function showScreen(screen) {
  const exam = document.getElementById('examSelect');
  const quiz = document.getElementById('quizContainer');
  const admin = document.getElementById('adminPanel');
  const back = document.getElementById('backButton');
  const adminBtn = document.getElementById('adminButton');
  const adminBack = document.getElementById('adminBackButton');
  const nextBtn = document.getElementById('nextButton');

  // ẩn tất cả
  exam.classList.add('hidden');
  quiz.classList.add('hidden');
  admin.classList.add('hidden');

  // hiện màn hình cần
  document.getElementById(screen).classList.remove('hidden');

  // ẩn tất cả nút back
  back.classList.add('hidden');
  adminBack.classList.add('hidden');
  adminBtn.classList.add('hidden');
  nextBtn.classList.add('hidden');

  // logic hiển thị nút theo màn hình
  if (screen === 'examSelect') {
    adminBtn.classList.remove('hidden');
  } else if (screen === 'quizContainer') {
    back.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
  } else if (screen === 'adminPanel') {
    adminBack.classList.remove('hidden');
  }
}
// ======================
// START EXAM
// ======================
function startExam() {
  const examNumber = document.getElementById('examDropdown').value;

  if (!examNumber) {
    alert('Hãy chọn kỳ thi');
    return;
  }

  // RESET trạng thái cũ
  currentExam = Number(examNumber);
  currentQuestion = 0;
  correctCount = 0;
  filteredQuestions = [];

  // Lọc câu hỏi theo kỳ thi
  filteredQuestions = questions.filter(
    (q) => String(q.exam) === String(currentExam),
  );

  console.log('Questions:', filteredQuestions);

  // Nếu kỳ thi không có câu hỏi
  if (filteredQuestions.length === 0) {
    showScreen('quizContainer');

    document.getElementById('questionTitle').innerText = 'Không có dữ liệu';
    document.getElementById('questionContent').innerText =
      'Kỳ thi này chưa có câu hỏi';
    document.getElementById('optionsContainer').innerHTML = '';

    document.getElementById('progress').innerText = '';
    document.getElementById('score').innerText = '✔ 0';

    return;
  }

  // Trộn câu hỏi
  filteredQuestions.sort(() => Math.random() - 0.5);

  showScreen('quizContainer');

  loadQuestion();
}
// ======================
// BACK TO EXAM SELECT
// ======================
function goHome() {
  showScreen('examSelect');
}
// ======================
// SELECT EXAM
// ======================
/*
function selectExam(examNumber) {
  selectedExam = examNumber;
  currentQuestion = 0;

  showScreen('quizContainer');

  loadQuestion();
}
// ======================
*/
// LOAD QUESTION
// ======================
function loadQuestion() {
  if (filteredQuestions.length === 0) {
    console.log('Không có câu hỏi');
    return;
  }

  const q = filteredQuestions[currentQuestion];
  if (!q) {
    console.log('Câu hỏi undefined');
    return;
  }

  const title = document.getElementById('questionTitle');
  const content = document.getElementById('questionContent');
  const optionsContainer = document.getElementById('optionsContainer');

  document.getElementById('progress').innerText =
    'Câu ' + (currentQuestion + 1) + ' / ' + filteredQuestions.length;

  document.getElementById('score').innerText = '✔ ' + correctCount;

  content.innerHTML = '';
  optionsContainer.innerHTML = '';

  if (q.type === 'single') {
    title.innerHTML = 'Câu ' + (currentQuestion + 1);

    content.innerHTML = convertFurigana(q.question);

    if (q.image && q.image !== '') {
      const img = document.createElement('img');
      img.src = q.image;
      img.style.maxWidth = '300px';
      img.style.display = 'block';
      img.style.margin = '10px 0';
      content.appendChild(img);
    }

    q.options.forEach((opt, index) => {
      const btn = document.createElement('button');

      btn.innerHTML = convertFurigana(opt);

      btn.onclick = () => checkSingleAnswer(index, q.answer, btn);

      optionsContainer.appendChild(btn);
    });
  } else if (q.type === 'group') {
    title.innerHTML = convertFurigana(q.title);

    content.innerHTML = convertFurigana(q.content).replace(/\n/g, '<br>');

    if (q.image && q.image !== '') {
      const img = document.createElement('img');
      img.src = q.image;
      img.style.maxWidth = '300px';
      img.style.display = 'block';
      img.style.margin = '10px 0';
      content.appendChild(img);
    }

    q.blanks.forEach((blank) => {
      const blankDiv = document.createElement('div');
      blankDiv.className = 'blank-block';

      const label = document.createElement('p');
      label.innerText = '(' + (blank.id || '') + ')';

      blankDiv.appendChild(label);

      blank.options.forEach((opt, index) => {
        const btn = document.createElement('button');

        btn.innerHTML = convertFurigana(opt);

        btn.onclick = () => {
          checkSingleAnswer(index, blank.answer, btn);
          btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        blankDiv.appendChild(btn);
      });

      optionsContainer.appendChild(blankDiv);
    });
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  renderMath();
}

// ======================
// CHECK ANSWER
// ======================
function checkSingleAnswer(selected, correct, button) {
  if (correct === null || correct === undefined || correct === '') return;

  const correctIndex = parseInt(correct);
  if (isNaN(correctIndex)) return;

  // mark clicked button
  if (selected === correctIndex && !button.classList.contains('correct')) {
    button.classList.add('correct');
    correctCount++;
  } else {
    button.classList.add('wrong');
  }

  // highlight the correct button and disable all buttons in the same block
  const container = button.parentElement;
  const buttons = Array.from(container.querySelectorAll('button'));
  buttons.forEach((b, i) => {
    if (i === correctIndex) b.classList.add('correct');
    b.disabled = true;
  });
  renderMath();
}

// ======================
// NEXT QUESTION
// ======================
function nextQuestion() {
  if (currentQuestion + 1 >= filteredQuestions.length) {
    alert(
      'Hoàn thành!\n\nĐiểm: ' +
        correctCount +
        ' / ' +
        filteredQuestions.length +
        'Câu hỏi',
    );

    showScreen('examSelect');
    return;
  }

  currentQuestion++;

  loadQuestion();
}

// ======================
// ADMIN CONTROL
// ======================
/*function openAdmin() {
  document.getElementById('adminPanel').classList.remove('hidden');
  document.getElementById('quizContainer').classList.add('hidden');
}*/
function openAdmin() {
  const password = prompt('Nhập mật khẩu Admin:');

  if (password === '123456') {
    // ← bạn đổi mật khẩu ở đây
    showScreen('adminPanel');
  } else {
    alert('Sai mật khẩu!');
  }
}

function closeAdmin() {
  showScreen('examSelect');
}

// ======================
// CHANGE TYPE
// ======================
function changeType() {
  const type = document.getElementById('questionType').value;

  if (type === 'single') {
    document.getElementById('singleForm').classList.remove('hidden');
    document.getElementById('groupForm').classList.add('hidden');
  } else {
    document.getElementById('singleForm').classList.add('hidden');
    document.getElementById('groupForm').classList.remove('hidden');
  }
}

// ======================
// GENERATE CODE
// ======================
function generateCode() {
  const exam = document.getElementById('adminExam').value;
  const type = document.getElementById('questionType').value;
  let output = '';

  if (type === 'single') {
    let question = document.getElementById('singleQuestion').value;
    question = escapeForJS(prepareLatex(question));

    const image = document.getElementById('imageUrl').value;

    const optionsRaw = document.getElementById('singleOptions').value;

    const answerValue = document.getElementById('singleAnswer').value.trim();
    const answer = answerValue !== '' ? parseInt(answerValue) : null;

    const options = optionsRaw
      .split('\n')
      .map((opt) => opt.trim())
      .filter(Boolean)
      .map((opt) => `"${escapeForJS(prepareLatex(opt))}"`);

    output = `
{
  exam: ${exam},
  type: "single",
  question: "${question}",
  image: "${image}",
  options: [
    ${options.join(',\n    ')}
  ],
  answer: ${answer}
},
`;
  } else {
    let title = document.getElementById('groupTitle').value;
    title = escapeForJS(prepareLatex(title));

    const image = document.getElementById('groupImage').value;

    let content = document.getElementById('groupContent').value;
    content = escapeForJS(prepareLatex(content));

    const blanksRaw = document.getElementById('groupBlanks').value;

    const blankLines = blanksRaw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    let blanksCode = blankLines.map((line) => {
      const parts = line.split('|').map((p) => p.trim());

      const id = parseInt(parts[0]);

      let answer;
      if (!parts[2]) {
        answer = null;
      } else {
        answer = parseInt(parts[2]);
      }

      const options = parts[1]
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
        .map((o) => `"${prepareLatex(o)}"`);

      return `
    {
      id: ${id},
      options: [${options.join(', ')}],
      answer: ${answer}
    }`;
    });

    output = `
{
  exam: ${exam},
  type: "group",
  title: "${title}",
  image: "${image}",
  content: "${content}",
  blanks: [
    ${blanksCode.join(',')}
  ]
},
`;
  }

  document.getElementById('outputCode').value = output;
}
// ======================
// SERVICE WORKER
// ======================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('sw.js')
      .then(function (registration) {
        console.log('SW registered:', registration);
      })
      .catch(function (error) {
        console.log('SW failed:', error);
      });
  });
}
// ======================
// RENDER MATHJAX
// ======================
function renderMath() {
  if (window.MathJax) {
    MathJax.typesetPromise()
      .then(() => console.log('MathJax rendered'))
      .catch((err) => console.log(err.message));
  }
}

// ======================
// PREPARE LATEX
// ======================
function prepareLatex(text) {
  if (!text) return '';

  text = text.trim();

  const hasLatex =
    text.includes('\\frac') ||
    text.includes('\\sqrt') ||
    text.includes('\\sum') ||
    text.includes('\\int') ||
    text.includes('\\displaylines');

  if (hasLatex && !text.includes('\\[')) {
    text = '\\[' + text + '\\]';
  }

  return text;
}
// ======================
function escapeForJS(text) {
  if (!text) return '';

  return text
    .replace(/\\/g, '\\\\') // escape \
    .replace(/"/g, '\\"') // escape "
    .replace(/\n/g, '\\n'); // xuống dòng
}
