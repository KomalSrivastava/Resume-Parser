import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PineconeClient } from '@pinecone-database/pinecone';
import * as pdfjsLib from 'pdf-parse';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const pinecone = new PineconeClient();

async function initPinecone() {
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT || '',
    apiKey: process.env.PINECONE_API_KEY || '',
  });
}

async function parseResume(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfjsLib.default(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  }
}

async function generateEmbeddings(text: string) {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding;
}

async function analyzeCandidateProfile(text: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `
    Analyze the following candidate profile and provide:
    1. A brief summary of their background
    2. Key skills identified
    3. Experience level assessment
    4. Potential role matches
    5. Areas for improvement

    Profile:
    ${text}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const linkedinUrl = formData.get('linkedinUrl') as string;
    const skills = formData.get('skills') as string;
    const experience = formData.get('experience') as string;
    const resumeFile = formData.get('resume') as File;

    let resumeText = '';
    if (resumeFile) {
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      resumeText = await parseResume(buffer);
    }

    // Combine all text for analysis
    const fullProfile = `
      Name: ${name}
      Email: ${email}
      LinkedIn: ${linkedinUrl}
      Skills: ${skills}
      Experience: ${experience}
      Resume: ${resumeText}
    `;

    // Generate embeddings
    const embeddings = await generateEmbeddings(fullProfile);

    // Initialize Pinecone
    await initPinecone();
    const index = pinecone.Index('candidates');

    // Store in Pinecone
    await index.upsert([{
      id: email, // Use email as unique identifier
      values: embeddings,
      metadata: {
        name,
        email,
        linkedinUrl,
        timestamp: new Date().toISOString(),
      },
    }]);

    // Analyze profile with Gemini
    const analysis = await analyzeCandidateProfile(fullProfile);

    // Find matching jobs
    const queryResponse = await index.query({
      vector: embeddings,
      topK: 5,
      includeMetadata: true,
      namespace: 'jobs',
    });

    return NextResponse.json({
      success: true,
      analysis,
      matchingJobs: queryResponse.matches,
    });
  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    );
  }
}