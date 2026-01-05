// PrepPAL/frontend/src/features/modules/api/mock-data.ts

export const MOCK_QUIZ = {
  id: '1',
  title: 'Sample Assessment',
  questions: [
    {
      id: 101,
      questionText: 'What is the first step in developing a personal financial plan?',
      explanation: 'Assessing your current financial situation is crucial before setting goals or creating a budget.',
      choices: [
        { id: 1, text: 'Create a budget', isCorrect: false },
        { id: 2, text: 'Assess your current financial situation', isCorrect: true },
        { id: 3, text: 'Open a savings account', isCorrect: false },
      ]
    },
    {
      id: 102,
      questionText: 'Which of the following is an example of a fixed expense?',
      explanation: 'Fixed expenses stay the same amount each month, like rent or a mortgage.',
      choices: [
        { id: 1, text: 'Groceries', isCorrect: false },
        { id: 2, text: 'Rent or Mortgage', isCorrect: true },
        { id: 3, text: 'Entertainment', isCorrect: false },
      ]
    },
    {
      id: 103,
      questionText: 'What is the primary purpose of an emergency fund?',
      explanation: 'An emergency fund provides a financial safety net for unexpected costs.',
      choices: [
        { id: 1, text: 'To save for a vacation', isCorrect: false },
        { id: 2, text: 'To cover unexpected expenses', isCorrect: true },
        { id: 3, text: 'To invest in the stock market', isCorrect: false },
      ]
    },
    {
      id: 104,
      questionText: 'Compound interest is best described as:',
      explanation: 'Compound interest allows your money to grow faster by earning interest on previously earned interest.',
      choices: [
        { id: 1, text: 'Interest earned only on the principal', isCorrect: false },
        { id: 2, text: 'Interest earned on principal and previously accumulated interest', isCorrect: true },
        { id: 3, text: 'A fixed rate of interest over time', isCorrect: false },
      ]
    },
    {
      id: 105,
      questionText: 'A higher credit score typically leads to:',
      explanation: 'Lenders see a high credit score as a sign of reliability, offering lower interest rates.',
      choices: [
        { id: 1, text: 'Higher interest rates on loans', isCorrect: false },
        { id: 2, text: 'Lower interest rates on loans', isCorrect: true },
        { id: 3, text: 'No impact on borrowing', isCorrect: false },
      ]
    },
  ]
};