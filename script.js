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
// RENDER IMAGES
// ======================
function renderImages(images) {
  if (!images || images.length === 0) return '';

  return `
    <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin:10px 0;">
      ${images
        .map(
          (src) => `
        <img src="${src}" style="width:100%; border-radius:10px;">
      `,
        )
        .join('')}
    </div>
  `;
}
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

  // 👉 Gom ảnh (hỗ trợ cả image cũ + images mới)
  const images = q.images || (q.image ? [q.image] : []);

  if (q.type === 'single') {
    title.innerHTML = 'Câu ' + (currentQuestion + 1);

    content.innerHTML = convertFurigana(q.question) + renderImages(images);

    q.options.forEach((opt, index) => {
      const btn = document.createElement('button');

      btn.innerHTML = convertFurigana(opt);

      btn.onclick = () => checkSingleAnswer(index, q.answer, btn);

      optionsContainer.appendChild(btn);
    });
  } else if (q.type === 'group') {
    title.innerHTML = convertFurigana(q.title);

    content.innerHTML =
      convertFurigana(q.content).replace(/\n/g, '<br>') + renderImages(images);

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

  const labels = ['ア.', 'イ.', 'ウ.', 'エ.', 'オ.', 'カ.', 'キ.', 'ク.'];

  if (type === 'single') {
    let question = document.getElementById('singleQuestion').value;
    question = escapeForJS(fixInlineLatex(prepareLatex(question)));

    const imageRaw = document.getElementById('imagesUrls').value;

    const images = imageRaw
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i !== '')
      .map((i) => `"${i.replace(/\\/g, '/')}"`); // 🔥 tự động sửa \ → /
    const optionsRaw = document.getElementById('singleOptions').value;

    const answerValue = document.getElementById('singleAnswer').value.trim();
    const answer = answerValue !== '' ? parseInt(answerValue) : null;

    const rawOptions = splitOptionsSafe(optionsRaw);

    const options = rawOptions.map((opt, index) => {
      let fixed = fixInlineLatex(prepareLatex(opt));
      return `"${labels[index]} ${escapeForJS(fixed)}"`;
    });

    output = `
{
  exam: ${exam},
  type: "single",
  question: "${question}",
  images: [
           ${images.join(',\n    ')}
          ],
  options: [
    ${options.join(',\n    ')}
  ],
  answer: ${answer}
},
`;
  } else {
    let title = document.getElementById('groupTitle').value;
    title = escapeForJS(fixInlineLatex(prepareLatex(title)));

    const imageRaw = document.getElementById('imageUrls').value;

    const images = imageRaw
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i !== '')
      .map((i) => `"${i.replace(/\\/g, '/')}"`); // 🔥 tự động sửa \ → /

    let content = document.getElementById('groupContent').value;
    content = escapeForJS(fixInlineLatex(prepareLatex(content)));

    const blanksRaw = document.getElementById('groupBlanks').value;

    const blankLines = blanksRaw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    let blanksCode = blankLines.map((line) => {
      const parts = line.split('|').map((p) => p.trim());

      const id = parseInt(parts[0]);
      const answer = parts[2] ? parseInt(parts[2]) : null;

      const rawOptions = splitOptionsSafe(parts[1]);

      const options = rawOptions.map((o, index) => {
        let fixed = fixInlineLatex(prepareLatex(o));
        return `"${labels[index]} ${escapeForJS(fixed)}"`;
      });

      return `
    {
      id: ${id},
      options: [
        ${options.join(',\n        ')}
      ],
      answer: ${answer}
    }`;
    });

    output = `
{
  exam: ${exam},
  type: "group",
  title: "${title}",
  images: [
           ${images.join(',\n    ')}
          ],
  content: \`${content}\`,
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
function prepareLatex(str) {
  if (!str) return str;

  return str.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}
// ====================== ham escape cho JS string, tránh lỗi khi có dấu " hoặc \ trong câu hỏi hoặc đáp án ======================
function escapeForJS(str) {
  if (!str) return str;

  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/`/g, '\\`');
}

// ====================== ham tách options tiếng Nhật ======================
function splitJapaneseOptions(str) {
  if (!str) return [];

  const result = [];
  let current = '';
  let brace = 0;
  let paren = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === '{') brace++;
    if (char === '}') brace--;

    if (char === '(') paren++;
    if (char === ')') paren--;

    // split tại ", ア." thay vì chỉ ","
    if (
      char === ',' &&
      brace === 0 &&
      paren === 0 &&
      /[ア-ン]/.test(str[i + 2]) // kiểm tra ký tự sau ", "
    ) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

/// ====================== ham tự động sửa lỗi LaTeX phổ biến trong câu hỏi và đáp án (phiên bản nâng cao) ======================
function fixInlineLatex(str) {
  if (!str) return str;

  let result = '';
  let i = 0;

  while (i < str.length) {
    // tìm \displaylines
    if (str.startsWith('\\displaylines', i)) {
      let start = str.indexOf('{', i);
      if (start === -1) break;

      let depth = 0;
      let j = start;

      // tìm dấu } đóng đúng
      while (j < str.length) {
        if (str[j] === '{') depth++;
        else if (str[j] === '}') depth--;

        if (depth === 0) break;
        j++;
      }

      // lấy nội dung bên trong
      const content = str.substring(start + 1, j);

      // thay bằng inline latex
      result += `\\( ${content} \\)`;

      i = j + 1;
    } else {
      result += str[i];
      i++;
    }
  }

  return result;
}
// ====================== ham tách options tiếng Nhật, nhưng an toàn hơn, không bị lỗi khi có dấu , trong {} ======================
function splitOptionsSafe(str) {
  if (!str) return [];

  const result = [];
  let current = '';
  let depth = 0; // theo dõi {}

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === '{') depth++;
    if (char === '}') depth--;

    // CHỈ split khi ngoài {}
    if (char === ',' && depth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}
