import { v4 as uuidv4 } from 'uuid';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  imageUrl?: string;
  timestamp: number;
};

export type BackendState = {
  step: 'initial' | 'concept_check' | 'solving' | 'explanation' | 'complete';
  problem?: string;
  concept?: string;
};

let currentState: BackendState = {
  step: 'initial',
};

export const simulateBackendResponse = async (
  input: string | File,
  history: Message[]
): Promise<Message> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const lastUserMessage = history[history.length - 1];

  if (input instanceof File || (typeof input === 'string' && input.startsWith('data:image'))) {
    currentState = {
      step: 'concept_check',
      problem: '(4+2)/3',
      concept: 'order of operations (BODMAS/PEMDAS)',
    };
    return {
      id: uuidv4(),
      role: 'assistant',
      content: `I see you've uploaded a math problem. It looks like: ${currentState.problem}. \n\nBefore we solve it, do you know about ${currentState.concept}?`,
      timestamp: Date.now(),
    };
  }

  const textInput = typeof input === 'string' ? input.toLowerCase() : '';

  if (currentState.step === 'concept_check') {
    if (textInput.includes('yes') || textInput.includes('yeah')) {
      currentState.step = 'solving';
      return {
        id: uuidv4(),
        role: 'assistant',
        content: "Great! In that case, what should we solve first in this expression: (4+2)/3?",
        timestamp: Date.now(),
      };
    } else {
      currentState.step = 'explanation';
      return {
        id: uuidv4(),
        role: 'assistant',
        content: "No worries! Order of operations tells us which part of the math problem to calculate first. We usually start with Brackets (or Parentheses). \n\nSo, looking at (4+2)/3, what do you think we should do first?",
        timestamp: Date.now(),
      };
    }
  }

  if (currentState.step === 'solving' || currentState.step === 'explanation') {
    if (textInput.includes('bracket') || textInput.includes('parenthes') || textInput.includes('4+2') || textInput.includes('add')) {
      currentState.step = 'complete';
      return {
        id: uuidv4(),
        role: 'assistant',
        content: "Exactly! We solve the brackets first. 4 + 2 = 6. \n\nSo now the problem becomes 6 / 3. What is the final answer?",
        timestamp: Date.now(),
      };
    } else {
      return {
        id: uuidv4(),
        role: 'assistant',
        content: "Not quite. Remember, we need to look at what's inside the parentheses first. Try again!",
        timestamp: Date.now(),
      };
    }
  }
  
  if (currentState.step === 'complete') {
      if (textInput.includes('2')) {
          return {
              id: uuidv4(),
              role: 'assistant',
              content: "Correct! The answer is 2. Great job! Feel free to upload another problem.",
              timestamp: Date.now(),
          }
      }
  }

  return {
    id: uuidv4(),
    role: 'assistant',
    content: "I'm not sure I understand. Could you clarify?",
    timestamp: Date.now(),
  };
};
