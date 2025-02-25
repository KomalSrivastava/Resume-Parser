import { CandidateForm } from '@/components/candidate-form';
import { JobPostingForm } from '@/components/job-posting-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, UserCircle, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-gray-800 mb-4">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">AI-Powered Talent Matching</span>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
            Find Your Perfect Match
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our advanced AI technology analyzes profiles and job postings to create meaningful connections between talent and opportunities.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl transform -rotate-1"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-blue-50 to-indigo-50 rounded-3xl transform rotate-1"></div>
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
            <Tabs defaultValue="candidate" className="max-w-4xl mx-auto">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <TabsList className="grid w-full grid-cols-2 gap-4">
                  <TabsTrigger 
                    value="candidate" 
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 px-4 py-2">
                      <UserCircle className="h-5 w-5" />
                      <span className="font-medium">I'm a Candidate</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="employer"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 px-4 py-2">
                      <Building2 className="h-5 w-5" />
                      <span className="font-medium">I'm an Employer</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="p-6">
                <TabsContent value="candidate" className="mt-0">
                  <CandidateForm />
                </TabsContent>
                <TabsContent value="employer" className="mt-0">
                  <JobPostingForm />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}