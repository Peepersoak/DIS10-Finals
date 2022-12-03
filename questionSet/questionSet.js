const questionSet = [
  {
    finalQuestion: {
      question: "What is the answer to answer to Clue #5",
      answer: "{2,4,6,8,12,16}",
    },
    questionList: [
      "Clue #1 | What is the union of {1,2,3,4} and {3,4,5,6}", // {1,2,3,4,5,6}
      "Clue #2 | What is the union of {2,4,6,8} and {4,8,12,16}", // {2,4,6,8,12,16}
      "Clue #3 | What is the intersection of Clue #1 and Clue #2", // {2,4,6}
      "Clue #4 | What is the intersection of Clue #1 and Clue #3", // {2,4,6}
      "Clue #5 | What is the union of Clue #2 and Clue #4", // {2,4,6,8,12,16}
    ],
  },
];

export default questionSet;
