import * as pdfjsLib from 'pdf-parse';

export interface ParsedResume {
  text: string;
  skills: string[];
  education: string[];
  experience: string[];
}

const SKILL_KEYWORDS = [
  'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js',
  'aws', 'azure', 'docker', 'kubernetes', 'sql', 'nosql', 'agile',
  'project management', 'leadership', 'communication', 'problem solving'
];

const EDUCATION_KEYWORDS = [
  'bachelor', 'master', 'phd', 'degree', 'university', 'college',
  'certification', 'diploma'
];

export async function parseResume(buffer: Buffer): Promise<ParsedResume> {
  try {
    const data = await pdfjsLib.default(buffer);
    const text = data.text.toLowerCase();
    
    const skills = SKILL_KEYWORDS.filter(skill => 
      text.includes(skill.toLowerCase())
    );

    const education = text
      .split('\n')
      .filter(line => 
        EDUCATION_KEYWORDS.some(keyword => 
          line.toLowerCase().includes(keyword)
        )
      );

    const experience = text
      .split('\n')
      .filter(line => 
        line.match(/\b(19|20)\d{2}\b/) && // Lines containing years
        line.length > 50 // Substantial content
      );

    return {
      text: data.text,
      skills,
      education,
      experience
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  }
}