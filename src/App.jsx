import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Briefcase, 
  Users, 
  Target, 
  Globe, 
  Lightbulb, 
  Share2,
  Send,
  ArrowRight,
  Loader2
} from 'lucide-react';

// --- CONFIGURATION ---
// UPDATED WITH YOUR NEW URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhZ37ccPIVqloHmNK4RVSa5LCEOcTZU7voLVE0xWUhulwTxf00956DORM9zz0O2kE/exec"; 

// --- Reusable UI Components ---

const Label = ({ children, required }) => (
  <label className="block text-sm font-medium text-slate-700 mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Input = ({ label, type = "text", placeholder, value, onChange, name, required }) => (
  <div className="mb-4">
    <Label required={required}>{label}</Label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
      required={required}
    />
  </div>
);

const TextArea = ({ label, placeholder, value, onChange, name, required }) => (
  <div className="mb-4">
    <Label required={required}>{label}</Label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 resize-none"
      required={required}
    />
  </div>
);

const Select = ({ label, options, value, onChange, name, required }) => (
  <div className="mb-4">
    <Label required={required}>{label}</Label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
      required={required}
    >
      <option value="" disabled>Select an option</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const CheckboxGroup = ({ label, options, selectedValues = [], onChange, name }) => {
  const toggleOption = (option) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(name, newValues);
  };

  return (
    <div className="mb-5">
      <Label>{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <div 
            key={option}
            onClick={() => toggleOption(option)}
            className={`cursor-pointer px-4 py-3 rounded-lg border flex items-center gap-3 transition-all ${
              selectedValues.includes(option)
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
              selectedValues.includes(option) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
            }`}>
              {selectedValues.includes(option) && <CheckCircle2 size={14} className="text-white" />}
            </div>
            <span className="text-sm font-medium">{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RadioCard = ({ label, icon: Icon, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer p-5 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center h-full ${
      selected
        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:shadow-sm'
    }`}
  >
    <div className={`p-3 rounded-full ${selected ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
      <Icon size={24} />
    </div>
    <span className="font-semibold text-sm">{label}</span>
  </div>
);

const YesNo = ({ label, value, onChange, name }) => (
  <div className="mb-4">
    <Label>{label}</Label>
    <div className="flex gap-4 mt-2">
      {['Yes', 'No'].map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={onChange}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="text-slate-700">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

// --- Main Application ---

export default function ClientOnboardingForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: General
    fullName: '', email: '', phone: '', country: '', companyName: '', website: '',
    challenge: '', revenue: '', budgetRange: '', startTime: '', communication: [], source: '',
    
    // Step 2: Service Selection
    serviceCategory: '',

    // Part 3: AI Consultancy
    ai_teamSize: '', ai_businessDesc: '', ai_tasks: '', ai_timeParts: '', ai_depts: [],
    ai_tools: '', ai_toolsConnected: '', ai_crm: '', ai_objective: '', ai_goLive: '', ai_budget: '',

    // Part 4: Recruitment
    rec_hiringVol: '', rec_sourcing: '', rec_tools: '', rec_timeParts: [], rec_features: [],
    rec_dashboard: '', rec_whiteLabel: '', rec_budget: '',

    // Part 5: Lead Gen
    lead_product: '', lead_audience: '', lead_avgRev: '', lead_sources: [], lead_challenges: [],
    lead_monthlyLeads: '', lead_autoFollow: '', lead_crm: '', lead_bot: '', lead_budget: '',

    // Part 6: Website SEO
    web_type: '', web_contentReady: '', web_copywriting: '', web_inspiration: '', web_colors: '',
    web_logo: '', web_features: [], web_keywords: '', web_location: '', web_competitors: '', web_budget: '',

    // Part 7: Entrepreneur
    ent_role: '', ent_years: '', ent_runningBiz: '', ent_idea: '', ent_struggles: [],
    ent_90dayGoals: '', ent_method: '', ent_schedule: '', ent_budgetStruct: '',

    // Part 8: Social Media
    soc_links: '', soc_platforms: [], soc_regular: '', soc_guidelines: '', soc_goals: [],
    soc_audience: '', soc_competitors: '', soc_styles: [], soc_handleComments: '', soc_budget: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Basic validation check
    if (step === 1 && (!formData.fullName || !formData.email)) {
      alert("Please fill in required fields.");
      return;
    }
    if (step === 2 && !formData.serviceCategory) {
      alert("Please select a service category.");
      return;
    }
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Use 'no-cors' mode to avoid CORS errors with Google Apps Script
      // Note: We won't get a readable response status in 'no-cors', but the request usually succeeds.
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        // We send as text/plain to prevent a preflight OPTIONS request
        // which Google Apps Script doesn't handle well.
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(formData)
      });

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Step Content Renders ---

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe" />
        <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
        <Input label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1 (555) 000-0000" />
        <Input label="Country" name="country" value={formData.country} onChange={handleChange} required placeholder="United States" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Acme Inc." />
        <Input label="Website / Social Link" name="website" value={formData.website} onChange={handleChange} placeholder="https://" />
      </div>

      <TextArea label="What challenge are you facing right now?" name="challenge" value={formData.challenge} onChange={handleChange} placeholder="Briefly describe your main pain point..." required />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Current Monthly Revenue" name="revenue" value={formData.revenue} onChange={handleChange} placeholder="e.g. $5,000" />
        <Select 
          label="Budget Range" 
          name="budgetRange" 
          value={formData.budgetRange} 
          onChange={handleChange} 
          options={["Under $1,000", "$1,000 - $5,000", "$5,001 - $10,000", "Over $10,000", "Prefer not to disclose"]} 
        />
      </div>

      <Select 
        label="How soon do you want to start?" 
        name="startTime" 
        value={formData.startTime} 
        onChange={handleChange} 
        options={["Immediately (within 1 week)", "Within 2-4 weeks", "In 1-3 months", "Just exploring options"]} 
      />

      <CheckboxGroup 
        label="Preferred Communication Channel" 
        name="communication" 
        selectedValues={formData.communication} 
        onChange={handleMultiSelect} 
        options={["Email", "Phone Call", "Video Conference", "WhatsApp/Slack"]} 
      />

      <Select 
        label="Where did you hear about us?" 
        name="source" 
        value={formData.source} 
        onChange={handleChange} 
        options={["Search Engine", "Social Media", "Referral", "Industry Event", "Advertisement", "Other"]} 
      />
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">Which service category best fits your needs?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RadioCard 
          label="AI Consultancy" 
          icon={Lightbulb} 
          selected={formData.serviceCategory === 'AI Consultancy'} 
          onClick={() => setFormData({...formData, serviceCategory: 'AI Consultancy'})} 
        />
        <RadioCard 
          label="Recruitment & Onboarding" 
          icon={Users} 
          selected={formData.serviceCategory === 'Recruitment & Onboarding Systems'} 
          onClick={() => setFormData({...formData, serviceCategory: 'Recruitment & Onboarding Systems'})} 
        />
        <RadioCard 
          label="Lead Generation" 
          icon={Target} 
          selected={formData.serviceCategory === 'Lead Generation Systems'} 
          onClick={() => setFormData({...formData, serviceCategory: 'Lead Generation Systems'})} 
        />
        <RadioCard 
          label="Website & SEO" 
          icon={Globe} 
          selected={formData.serviceCategory === 'Website & SEO'} 
          onClick={() => setFormData({...formData, serviceCategory: 'Website & SEO'})} 
        />
        <RadioCard 
          label="Entrepreneur Support" 
          icon={Briefcase} 
          selected={formData.serviceCategory === 'Entrepreneur Support'} 
          onClick={() => setFormData({...formData, serviceCategory: 'Entrepreneur Support'})} 
        />
        <RadioCard 
          label="Social Media & Branding" 
          icon={Share2} 
          selected={formData.serviceCategory === 'Social Media & Branding'} 
          onClick={() => setFormData({...formData, serviceCategory: 'Social Media & Branding'})} 
        />
      </div>
    </div>
  );

  const renderStep3 = () => {
    switch (formData.serviceCategory) {
      case 'AI Consultancy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2 mb-4">AI Consultancy Details</h3>
            <Input label="Team Size" name="ai_teamSize" value={formData.ai_teamSize} onChange={handleChange} placeholder="e.g. 10-50" />
            <Input label="Describe your business in one line" name="ai_businessDesc" value={formData.ai_businessDesc} onChange={handleChange} />
            <TextArea label="Top 3 repetitive tasks your team does daily" name="ai_tasks" value={formData.ai_tasks} onChange={handleChange} />
            <TextArea label="Which parts of your business take the most time?" name="ai_timeParts" value={formData.ai_timeParts} onChange={handleChange} />
            
            <CheckboxGroup 
              label="Which departments need improvement?" 
              name="ai_depts" 
              selectedValues={formData.ai_depts} 
              onChange={handleMultiSelect} 
              options={["Sales", "Operations", "Customer Support", "Reporting & Analytics", "Finance", "Marketing", "HR"]} 
            />
            
            <Input label="What software/tools do you use now?" name="ai_tools" value={formData.ai_tools} onChange={handleChange} />
            <YesNo label="Are these tools connected to each other?" name="ai_toolsConnected" value={formData.ai_toolsConnected} onChange={handleChange} />
            <Input label="Are you using any CRM? (Name it)" name="ai_crm" value={formData.ai_crm} onChange={handleChange} />
            
            <Select 
              label="Primary Objective" 
              name="ai_objective" 
              value={formData.ai_objective} 
              onChange={handleChange} 
              options={["Reduce workload", "Save cost", "Increase revenue", "Improve CX", "Scale without staff"]} 
            />
            <Input label="Desired Go-Live Date" type="date" name="ai_goLive" value={formData.ai_goLive} onChange={handleChange} />
            <Select 
              label="Budget Range" 
              name="ai_budget" 
              value={formData.ai_budget} 
              onChange={handleChange} 
              options={["Under £500", "£500-£1,500", "£1,500-£3,000", "£3,000-£10,000", "£10,000+"]} 
            />
          </div>
        );

      case 'Recruitment & Onboarding Systems':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2 mb-4">Recruitment System Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Team Size" name="ai_teamSize" value={formData.ai_teamSize} onChange={handleChange} />
              <Input label="Hiring volume per month" name="rec_hiringVol" value={formData.rec_hiringVol} onChange={handleChange} />
            </div>
            <Input label="How do you find candidates?" name="rec_sourcing" value={formData.rec_sourcing} onChange={handleChange} placeholder="Job boards, referrals..." />
            <Input label="Current recruitment tools used?" name="rec_tools" value={formData.rec_tools} onChange={handleChange} />
            
            <CheckboxGroup 
              label="Most time-consuming parts?" 
              name="rec_timeParts" 
              selectedValues={formData.rec_timeParts} 
              onChange={handleMultiSelect} 
              options={["CV Sorting", "Screening Calls", "Scheduling Interviews", "Follow-ups", "Onboarding Docs", "Compliance"]} 
            />
             <CheckboxGroup 
              label="Features Wanted" 
              name="rec_features" 
              selectedValues={formData.rec_features} 
              onChange={handleMultiSelect} 
              options={["CV Parsing", "Auto Screening", "Auto Scheduling", "Email Automation", "Dashboard", "White-labeling", "Onboarding Checklist"]} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <YesNo label="Need a Dashboard?" name="rec_dashboard" value={formData.rec_dashboard} onChange={handleChange} />
              <YesNo label="Need White-labeling?" name="rec_whiteLabel" value={formData.rec_whiteLabel} onChange={handleChange} />
            </div>
            
            <Select 
              label="Estimated Monthly Budget" 
              name="rec_budget" 
              value={formData.rec_budget} 
              onChange={handleChange} 
              options={["Under £500", "£500-£1,500", "£1,500-£3,000", "£3,000+"]} 
            />
          </div>
        );

      case 'Lead Generation Systems':
        return (
           <div className="space-y-6">
             <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2 mb-4">Lead Generation Details</h3>
             <Input label="Product/Service Offered" name="lead_product" value={formData.lead_product} onChange={handleChange} />
             <Input label="Target Audience" name="lead_audience" value={formData.lead_audience} onChange={handleChange} />
             <Input label="Average Revenue per Client" name="lead_avgRev" value={formData.lead_avgRev} onChange={handleChange} />
             
             <CheckboxGroup 
              label="Where do you want leads from?" 
              name="lead_sources" 
              selectedValues={formData.lead_sources} 
              onChange={handleMultiSelect} 
              options={["Facebook", "LinkedIn", "Google", "Instagram", "Email", "Cold Calling", "AI Outreach", "TikTok"]} 
            />
            
            <CheckboxGroup 
              label="Current Challenges" 
              name="lead_challenges" 
              selectedValues={formData.lead_challenges} 
              onChange={handleMultiSelect} 
              options={["No leads", "High cost", "Low conversion", "No follow-up system", "No CRM", "Slow response", "No clear funnel"]} 
            />
            
            <Input label="Number of leads wanted per month" name="lead_monthlyLeads" value={formData.lead_monthlyLeads} onChange={handleChange} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <YesNo label="Automated Follow-up?" name="lead_autoFollow" value={formData.lead_autoFollow} onChange={handleChange} />
              <YesNo label="Need a CRM?" name="lead_crm" value={formData.lead_crm} onChange={handleChange} />
              <YesNo label="Appointment Setter Bot?" name="lead_bot" value={formData.lead_bot} onChange={handleChange} />
            </div>

            <Select 
              label="Budget Range" 
              name="lead_budget" 
              value={formData.lead_budget} 
              onChange={handleChange} 
              options={["Under £300", "£300-£700", "£700-£1,500", "£1,500+"]} 
            />
           </div>
        );

      case 'Website & SEO':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2 mb-4">Website & SEO Details</h3>
            <Select 
              label="Type of Website" 
              name="web_type" 
              value={formData.web_type} 
              onChange={handleChange} 
              options={["Business Website", "Ecommerce", "Personal Brand", "Portfolio", "Blog", "Other"]} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <YesNo label="Content Ready?" name="web_contentReady" value={formData.web_contentReady} onChange={handleChange} />
              <YesNo label="Need Copywriting?" name="web_copywriting" value={formData.web_copywriting} onChange={handleChange} />
              <YesNo label="Have a Logo?" name="web_logo" value={formData.web_logo} onChange={handleChange} />
            </div>
            
            <Input label="Inspiration Websites (URLs)" name="web_inspiration" value={formData.web_inspiration} onChange={handleChange} />
            <Input label="Color Preferences" name="web_colors" value={formData.web_colors} onChange={handleChange} />

            <CheckboxGroup 
              label="Features Needed" 
              name="web_features" 
              selectedValues={formData.web_features} 
              onChange={handleMultiSelect} 
              options={["Blog", "Booking System", "Payment System", "Member Login", "CRM Integration", "Chatbot", "SEO", "Speed Opt", "Analytics"]} 
            />
            
            <Input label="Target Keywords (3-5 phrases)" name="web_keywords" value={formData.web_keywords} onChange={handleChange} />
            <Input label="Target Location" name="web_location" value={formData.web_location} onChange={handleChange} />
            <Input label="Competitor Websites" name="web_competitors" value={formData.web_competitors} onChange={handleChange} />

            <Select 
              label="SEO Budget" 
              name="web_budget" 
              value={formData.web_budget} 
              onChange={handleChange} 
              options={["£150-£300", "£300-£700", "£700-£1,000", "£1,000+"]} 
            />
          </div>
        );
        
      case 'Entrepreneur Support':
        return (
           <div className="space-y-6">
             <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2 mb-4">Entrepreneur Support</h3>
             <Input label="Current Occupation/Role" name="ent_role" value={formData.ent_role} onChange={handleChange} />
             <Input label="Years of Experience" name="ent_years" value={formData.ent_years} onChange={handleChange} />
             <YesNo label="Currently running a business?" name="ent_runningBiz" value={formData.ent_runningBiz} onChange={handleChange} />
             
             {formData.ent_runningBiz === 'No' && (
                <Input label="What business/idea do you want to start?" name="ent_idea" value={formData.ent_idea} onChange={handleChange} />
             )}

            <CheckboxGroup 
              label="Current Struggles" 
              name="ent_struggles" 
              selectedValues={formData.ent_struggles} 
              onChange={handleMultiSelect} 
              options={["Strategy", "Cash flow", "Marketing", "Pricing", "Time Mgmt", "Team Building", "Scaling", "Mindset"]} 
            />

            <TextArea label="Goals for the next 90 days?" name="ent_90dayGoals" value={formData.ent_90dayGoals} onChange={handleChange} />
            
            <CheckboxGroup 
              label="Preferred Coaching Method" 
              name="ent_method" 
              selectedValues={formData.ent_method} 
              onChange={handleMultiSelect} 
              options={["Chat-based", "Video Calls", "Strategy Docs", "Templates", "Mix"]} 
            />
            
            <Input label="Preferred Schedule" name="ent_schedule" value={formData.ent_schedule} onChange={handleChange} placeholder="e.g. Evenings, Tuesdays..." />
            
            <Select 
              label="Preferred Budget Structure" 
              name="ent_budgetStruct" 
              value={formData.ent_budgetStruct} 
              onChange={handleChange} 
              options={["Monthly Retainer", "One-time Project Fee", "Need to Discuss"]} 
            />
           </div>
        );

      case 'Social Media & Branding':
         return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2 mb-4">Social Media & Branding</h3>
            <Input label="Social Media Links (FB, IG, TikTok, etc)" name="soc_links" value={formData.soc_links} onChange={handleChange} />
            <CheckboxGroup 
              label="Active Platforms" 
              name="soc_platforms" 
              selectedValues={formData.soc_platforms} 
              onChange={handleMultiSelect} 
              options={["Facebook", "Instagram", "TikTok", "YouTube", "LinkedIn", "Pinterest"]} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <YesNo label="Posting Regularly?" name="soc_regular" value={formData.soc_regular} onChange={handleChange} />
               <YesNo label="Brand Guidelines Exist?" name="soc_guidelines" value={formData.soc_guidelines} onChange={handleChange} />
            </div>

            <CheckboxGroup 
              label="Main Goals" 
              name="soc_goals" 
              selectedValues={formData.soc_goals} 
              onChange={handleMultiSelect} 
              options={["Brand Awareness", "Sales & Conversions", "Engagement", "Community Building", "Personal Branding"]} 
            />

            <TextArea label="Target Audience" name="soc_audience" value={formData.soc_audience} onChange={handleChange} />
            <Input label="Top Competitors" name="soc_competitors" value={formData.soc_competitors} onChange={handleChange} />

            <CheckboxGroup 
              label="Content Styles" 
              name="soc_styles" 
              selectedValues={formData.soc_styles} 
              onChange={handleMultiSelect} 
              options={["Reels", "Carousels", "Stories", "AI Spokesperson", "Product Demos", "Educational", "Behind-the-scenes", "UGC", "Long-form"]} 
            />
            
            <YesNo label="Handle Comments/DMs?" name="soc_handleComments" value={formData.soc_handleComments} onChange={handleChange} />
            
            <Select 
              label="Monthly Budget" 
              name="soc_budget" 
              value={formData.soc_budget} 
              onChange={handleChange} 
              options={["£300-£500", "£500-£1,000", "£1,000-£2,500", "£2,500+"]} 
            />
          </div>
         );

      default:
        return <div className="text-red-500">Please go back and select a service.</div>;
    }
  };

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} /> Submission Summary
        </h3>
        <div className="space-y-3 text-sm text-slate-700">
          <div className="grid grid-cols-3 gap-2 py-2 border-b border-indigo-100">
            <span className="font-medium text-slate-500">Name:</span>
            <span className="col-span-2 font-semibold">{formData.fullName}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-2 border-b border-indigo-100">
            <span className="font-medium text-slate-500">Email:</span>
            <span className="col-span-2 font-semibold">{formData.email}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-2 border-b border-indigo-100">
            <span className="font-medium text-slate-500">Service:</span>
            <span className="col-span-2 font-semibold text-indigo-600">{formData.serviceCategory}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-2">
            <span className="font-medium text-slate-500">Budget:</span>
            <span className="col-span-2 font-semibold">{formData.budgetRange}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-500 text-center italic">
        Please verify your details above before submitting. Our team will review your application and get back to you within 24 hours.
      </p>
      {submitError && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">
          {submitError}
        </div>
      )}
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in-up">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
        <CheckCircle2 size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">Application Received!</h2>
      <p className="text-slate-600 max-w-md mx-auto mb-8 text-lg">
        Thank you, <span className="font-semibold text-slate-900">{formData.fullName}</span>. We've received your details regarding <span className="font-semibold text-indigo-600">{formData.serviceCategory}</span>.
      </p>
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 max-w-sm w-full">
        <h4 className="font-semibold text-slate-800 mb-2">What happens next?</h4>
        <ul className="text-left text-sm text-slate-600 space-y-2">
          <li className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" /> 
            <span>Our team will review your submission and check if you are eligible.</span>
          </li>
          <li className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" /> 
            <span>We will contact you via email as soon as possible (within 12 hours).</span>
          </li>
        </ul>
      </div>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-8 text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-2"
      >
        Return to Home <ChevronRight size={16} />
      </button>
    </div>
  );

  // --- Step Wrapper ---

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-8 border border-slate-100">
          {renderSuccess()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
           <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
             <span>Step {step} of 4</span>
             <span>{step === 1 ? 'General Info' : step === 2 ? 'Service Selection' : step === 3 ? 'Specific Details' : 'Review'}</span>
           </div>
           <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-indigo-600"
               initial={{ width: 0 }}
               animate={{ width: `${(step / 4) * 100}%` }}
               transition={{ duration: 0.5 }}
             />
           </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 bg-white sticky top-0 z-10">
             <h1 className="text-2xl font-bold text-slate-900">Client Qualification</h1>
             <p className="text-slate-500 text-sm mt-1">Please fill out the details below so we can understand your needs.</p>
          </div>

          {/* Body */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderSummary()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                step === 1 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 bg-white border border-slate-200 shadow-sm'
              }`}
            >
              <ChevronLeft size={18} /> Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-lg font-medium shadow-lg shadow-green-200 transition-all active:scale-95 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Application <Send size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}