'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL'),
  skills: z.string().min(10, 'Please provide more details about your skills'),
  experience: z.string().min(50, 'Please provide more details about your experience'),
});

type FormData = z.infer<typeof formSchema>;

interface AnalysisResult {
  success: boolean;
  analysis: string;
  matchingJobs: Array<{
    metadata: {
      title: string;
      company: string;
      location: string;
    };
    score: number;
  }>;
}

export function CandidateForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setResumeFile(acceptedFiles[0]);
      toast.success('Resume uploaded successfully!');
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const response = await fetch('/api/submit-application', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();
      setAnalysisResult(result);
      toast.success('Application submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="John Doe"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input
            id="linkedinUrl"
            {...register('linkedinUrl')}
            placeholder="https://linkedin.com/in/johndoe"
            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
          {errors.linkedinUrl && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.linkedinUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Resume (PDF)</Label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : resumeFile 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              {resumeFile ? (
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  {resumeFile
                    ? `Selected: ${resumeFile.name}`
                    : 'Upload your resume'}
                </p>
                <p className="text-xs text-gray-500">
                  Drag & drop your PDF resume here, or click to select
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills">Key Skills</Label>
          <Textarea
            id="skills"
            {...register('skills')}
            placeholder="List your key technical and soft skills..."
            className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
          {errors.skills && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.skills.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Professional Experience</Label>
          <Textarea
            id="experience"
            {...register('experience')}
            placeholder="Describe your relevant work experience..."
            className="min-h-[150px] transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
          {errors.experience && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.experience.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Profile...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </form>

      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-xl font-semibold mb-4">AI Analysis Results</h3>
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {analysisResult.analysis}
                </div>
              </div>
            </Card>

            {analysisResult.matchingJobs?.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Matching Jobs</h3>
                <div className="space-y-4">
                  {analysisResult.matchingJobs.map((job, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-white shadow-sm border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{job.metadata.title}</h4>
                          <p className="text-sm text-gray-600">{job.metadata.company}</p>
                          <p className="text-sm text-gray-500">{job.metadata.location}</p>
                        </div>
                        <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {Math.round(job.score * 100)}% Match
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}