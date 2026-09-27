import { useState, FormEvent } from 'react';
import { Mail, Lock } from 'lucide-react';

interface UnlockReportProps {
  currentAge: string;
  currentPortfolio: string;
  monthlyInvestment: string;
  annualReturn: string;
  annualIncrease: string;
  inflation: string;
  projectUntilAge: string;
  showInTodaysDollars: boolean;
  onSuccess: (email: string) => void;
  isUnlocked: boolean;
}

export default function UnlockReport(props: UnlockReportProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const formData = new URLSearchParams();
      formData.append('form-name', 'wealth-report-signup');
      formData.append('EMAIL', email);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (!response.ok) throw new Error('Submission failed');

      props.onSuccess(email);
    } catch (err) {
      setError('Something went wrong — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form name="wealth-report-signup" data-netlify="true" onSubmit={handleSubmit} className="bg-neutral-900/50 border border-neutral-700/50 rounded-[24px] p-8 mt-12 shadow-xl">
      <input type="hidden" name="form-name" value="wealth-report-signup" />
      <h3 className="text-2xl font-bold mb-2 font-serif">Want Your Full Wealth Report?</h3>
      <p className="text-neutral-400 mb-6">Get complete results.</p>
      
      <div className="relative mb-4">
        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-neutral-500" />
        <input 
          type="email" 
          name="EMAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com" 
          disabled={props.isUnlocked || isSubmitting}
          className="w-full bg-neutral-950 border border-neutral-700 rounded-[16px] py-3 pl-10 pr-4 text-white disabled:opacity-50" 
        />
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      <button 
        type="submit"
        disabled={props.isUnlocked || isSubmitting}
        className="w-full bg-linear-to-r from-emerald-deep to-gold text-white font-bold py-4 rounded-[24px] text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_0_15px_rgba(201,161,90,0.2)] hover:shadow-[0_0_25px_rgba(201,161,90,0.4)]"
      >
        {isSubmitting ? 'SUBMITTING...' : props.isUnlocked ? 'Report sent ✓' : 'UNLOCK MY FULL REPORT'}
      </button>

      <div className="flex items-center justify-center text-neutral-500 text-xs mt-4 gap-1">
        <Lock className="w-3 h-3" />
        <p>No spam. Unsubscribe anytime.</p>
      </div>
    </form>
  );
}
