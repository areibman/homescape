export interface Entity {
  id: string;
  type: 'npc' | 'object';
  title: string;
  description: string;
  examineText: string;
  linkUrl: string;
  gridPosition: [number, number];
  icon?: string;
}

export const entityData: Entity[] = [
  // NPCs
  {
    id: 'bard',
    type: 'npc',
    title: 'Bard of Blogs',
    description: 'A wandering storyteller who shares tales and thoughts',
    examineText: 'A friendly bard who loves to share stories and insights.',
    linkUrl: 'https://github.com',
    gridPosition: [3, 2],
    icon: '🎭'
  },
  {
    id: 'keeper',
    type: 'npc',
    title: 'Keeper of Photos',
    description: 'Guardian of memories and visual stories',
    examineText: 'This keeper preserves precious moments and visual memories.',
    linkUrl: 'https://unsplash.com',
    gridPosition: [7, 4],
    icon: '📸'
  },
  {
    id: 'messenger',
    type: 'npc',
    title: 'Messenger',
    description: 'Delivers messages and connects people',
    examineText: 'A reliable messenger ready to carry your words.',
    linkUrl: 'mailto:hello@example.com',
    gridPosition: [5, 7],
    icon: '📮'
  },
  {
    id: 'sage',
    type: 'npc',
    title: 'Sage of Skills',
    description: 'Wise teacher sharing knowledge and expertise',
    examineText: 'This sage holds ancient knowledge and modern wisdom.',
    linkUrl: 'https://linkedin.com',
    gridPosition: [2, 5],
    icon: '🧙‍♂️'
  },
  {
    id: 'merchant',
    type: 'npc',
    title: 'Merchant of Projects',
    description: 'Trades in ideas and creative works',
    examineText: 'A merchant who deals in innovative projects and ideas.',
    linkUrl: 'https://github.com',
    gridPosition: [8, 3],
    icon: '💼'
  },
  
  // Objects
  {
    id: 'chest',
    type: 'object',
    title: 'Chest of Projects',
    description: 'A sturdy chest containing various creative works',
    examineText: 'This chest holds treasures of creativity and innovation.',
    linkUrl: 'https://codepen.io',
    gridPosition: [4, 6],
    icon: '📦'
  },
  {
    id: 'scroll',
    type: 'object',
    title: 'Scroll of Resume',
    description: 'Ancient parchment with professional achievements',
    examineText: 'A scroll detailing professional experience and skills.',
    linkUrl: 'https://linkedin.com',
    gridPosition: [6, 2],
    icon: '📜'
  },
  {
    id: 'crystal',
    type: 'object',
    title: 'Crystal of Contact',
    description: 'A glowing crystal that connects to distant realms',
    examineText: 'This crystal hums with energy, ready to connect you.',
    linkUrl: 'mailto:hello@example.com',
    gridPosition: [1, 4],
    icon: '💎'
  },
  {
    id: 'book',
    type: 'object',
    title: 'Book of About',
    description: 'A tome containing personal stories and background',
    examineText: 'This book holds the story of who I am and what I do.',
    linkUrl: 'https://github.com',
    gridPosition: [9, 5],
    icon: '📚'
  },
  {
    id: 'fountain',
    type: 'object',
    title: 'Fountain of Links',
    description: 'A magical fountain that flows with useful connections',
    examineText: 'The fountain bubbles with useful links and resources.',
    linkUrl: 'https://github.com',
    gridPosition: [5, 1],
    icon: '⛲'
  }
];