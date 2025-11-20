export interface Documentation {
  id: string;
  title: string;
  content: string;
  category: string;
  last_updated: string;
  author: string;
  slug?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  related_documentation_id?: string;
  category?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  estimated_time: number;
  category: string;
}

export interface TutorialStep {
  title: string;
  content: string;
  order: number;
}

export interface DocumentationSearchResult {
  documentation: Documentation[];
  faqs: FAQ[];
  tutorials: Tutorial[];
  total: number;
}
