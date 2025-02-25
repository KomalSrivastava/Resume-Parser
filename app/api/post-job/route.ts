import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PineconeClient } from '@pinecone-database/pinecone';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const pinecone = new PineconeClient();

async function initPinecone() {
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT || '',
    apiKey: process.env.PINECONE_API_KEY || '',
  });
}

async function generateEmbeddings(text: string) {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding;
}

async function analyzeJobPosting(text: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `
    Analyze the following job posting and provide:
    1. Key skills and qualifications required
    2. Experience level assessment
    3. Main responsibilities
    4. Unique benefits or perks
    5. Suggested candidate profile

    Job Posting:
    ${text}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json();
    
    // Combine job details for analysis
    const fullJobDescription = `
      Title: ${jobData.title}
      Company: ${jobData.company}
      Location: ${jobData.location}
      Type: ${jobData.type}
      Experience Level: ${jobData.experience}
      Description: ${jobData.description}
      Requirements: ${jobData.requirements}
      Benefits: ${jobData.benefits}
    `;

    // Generate embeddings
    const embeddings = await generateEmbeddings(fullJobDescription);

    // Initialize Pinecone
    await initPinecone();
    const index = pinecone.Index('jobs');

    // Store in Pinecone
    const jobId = `${jobData.company}-${Date.now()}`;
    await index.upsert([{
      id: jobId,
      values: embeddings,
      metadata: {
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        type: jobData.type,
        experience: jobData.experience,
        timestamp: new Date().toISOString(),
      },
    }]);

    // Analyze job posting with Gemini
    const analysis = await analyzeJobPosting(fullJobDescription);

    // Find matching candidates
    const queryResponse = await index.query({
      vector: embeddings,
      topK: 5,
      includeMetadata: true,
      namespace: 'candidates',
    });

    return NextResponse.json({
      success: true,
      jobId,
      analysis,
      matchingCandidates: queryResponse.matches,
    });
  } catch (error) {
    console.error('Error processing job posting:', error);
    return NextResponse.json(
      { error: 'Failed to process job posting' },
      { status: 500 }
    );
  }
}