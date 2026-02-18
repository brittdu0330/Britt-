
export enum LetterLength {
  VERY_SHORT = '50',
  SHORT = '100',
  STANDARD = '200',
  FULL = '500'
}

export enum LetterStyle {
  PROFESSIONAL = 'Professional',
  IMPACT = 'Impact-Oriented',
  STORY = 'Storytelling',
  PASSIONATE = 'Passionate',
  CREATIVE = 'Creative & Lively'
}

export interface GenerationConfig {
  length: LetterLength;
  style: LetterStyle;
}

export interface InputData {
  name: string;
  recentPosition: string;
  background: string;
  companyName: string;
  targetPosition: string;
  jobDescription: string;
}
