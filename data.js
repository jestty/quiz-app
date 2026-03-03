const questions = [
  // CÂU HỎI THƯỜNG
  {
    type: 'single',
    question: '日本語(にほんご) を 勉強(べんきょう) します。',
    options: ['Học tiếng Nhật', 'Ăn cơm', 'Đi học'],
    answer: 0,
  },

  // CÂU HỎI NHÓM
  {
    type: 'group',
    title: '問1 データの取り方',
    content: `
      ① 品質管理では、母集団からサンプルを抜き取ることを（1）という。<br>
      ② 計量データと（2）がある。
    `,
    blanks: [
      {
        id: 1,
        options: ['ア サンプリング', 'イ 抜取検査', 'ウ 工程管理'],
        answer: 0,
      },
      {
        id: 2,
        options: ['ア 計数データ', 'イ 母数', 'ウ 統計量'],
        answer: 0,
      },
    ],
  },
];
