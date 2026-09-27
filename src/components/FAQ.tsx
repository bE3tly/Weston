import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqItems = [
  {
    question: "Is this a subscription?",
    answer: "No. $15 is a one-time payment with lifetime access."
  },
  {
    question: "Do I need advanced finance knowledge?",
    answer: "No. The Blueprint is built for people who understand basic saving and investing but want a clearer system to follow — no jargon, no complex terminology."
  },
  {
    question: "Will it tell me exactly what stocks or funds to buy?",
    answer: "No. It is an educational planning and tracking system, not personalized investment advice."
  },
  {
    question: "Can I change my numbers later?",
    answer: "Yes. Every calculator and tracker updates automatically as your numbers and assumptions change — there's nothing to redo."
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neutral-700/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-6 px-6 text-left focus:outline-hidden"
      >
        <span className="text-lg font-serif font-bold text-white pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-gold transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="text-neutral-400 px-6 pb-6 pt-0">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold font-serif text-center mb-2">Frequently asked questions</h2>
        <p className="text-neutral-400 text-center mb-12">Everything you need to know before getting the Blueprint.</p>
        
        <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-[24px] overflow-hidden">
          {faqItems.map((item, index) => (
            <FAQItem key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
