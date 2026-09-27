/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, LineChart as ChartIcon, Check, Lock, ArrowDown, Sparkles, ArrowLeftRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import FAQ from './components/FAQ';
import UnlockReport from './components/UnlockReport';

export default function App() {
  const [currentAge, setCurrentAge] = useState<string>('27');
  const [currentPortfolio, setCurrentPortfolio] = useState<string>('10000');
  const [monthlyInvestment, setMonthlyInvestment] = useState<string>('750');
  const [annualReturn, setAnnualReturn] = useState<string>('8');
  
  const [annualIncrease, setAnnualIncrease] = useState<string>('0');
  const [inflation, setInflation] = useState<string>('0');
  const [projectUntilAge, setProjectUntilAge] = useState<string>('90');
  const [showInTodaysDollars, setShowInTodaysDollars] = useState<boolean>(false);

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [isReportUnlocked, setIsReportUnlocked] = useState<boolean>(false);
  const [results, setResults] = useState<{ milestone: number; age: string; ageNum: number }[] | null>(null);
  const [age50Value, setAge50Value] = useState<number | null>(null);
  const [age60Value, setAge60Value] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ age: number; portfolio: number; totalInvested: number }[]>([]);
  const [gapItem, setGapItem] = useState('');
  const [gapCost, setGapCost] = useState('');
  const [gapResult, setGapResult] = useState<{ futureValue: number; cost: number; difference: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; email: string } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const pricingSectionRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleScroll = () => {
      const isPastMilestones = window.scrollY > 1000; // Rough estimation
      const isAtPricing = pricingSectionRef.current?.getBoundingClientRect().top! < window.innerHeight;
      setShowSticky(isReportUnlocked && isPastMilestones && !isAtPricing && !isDismissed);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed, isReportUnlocked]);

  const calculateWealth = () => {
    setIsCalculating(true);
    setResults(null);
    setHasCalculated(true);

    setTimeout(() => {
      const age = parseInt(currentAge) || 27;
      const portfolio = parseFloat(currentPortfolio) || 10000;
      let monthly = parseFloat(monthlyInvestment) || 750;
      const rAnnual = (parseFloat(annualReturn) || 8) / 100;
      const incAnnual = (parseFloat(annualIncrease) || 0) / 100;
      const infAnnual = (parseFloat(inflation) || 0) / 100;
      const targetAge = parseInt(projectUntilAge) || 90;

      const milestones = [100000, 250000, 500000, 1000000];
      const newResults: { milestone: number; age: string; ageNum: number }[] = [];
      const reached = new Set<number>();
      const newChartData = [];

      let currentFV = portfolio;
      let totalInvested = portfolio;
      let monthsElapsed = 0;
      let currentMonthlyInvestment = monthly;
      let tempAge50 = null;
      let tempAge60 = null;

      while (age + (monthsElapsed / 12) <= targetAge) {
        if (monthsElapsed > 0 && monthsElapsed % 12 === 0) {
          currentMonthlyInvestment *= (1 + incAnnual);
        }

        if (monthsElapsed > 0) {
          totalInvested += currentMonthlyInvestment;
        }
        currentFV = currentFV * (1 + rAnnual / 12) + currentMonthlyInvestment;

        let displayFV = currentFV;
        if (showInTodaysDollars) {
          displayFV /= Math.pow(1 + infAnnual, monthsElapsed / 12);
        }
        
        const currentAgeMarker = age + Math.floor(monthsElapsed / 12);
        if (monthsElapsed % 12 === 0) {
          if (currentAgeMarker === 50) tempAge50 = displayFV;
          if (currentAgeMarker === 60) tempAge60 = displayFV;
          newChartData.push({ age: currentAgeMarker, portfolio: Math.round(displayFV), totalInvested: Math.round(totalInvested) });
        }

        for (const m of milestones) {
          if (!reached.has(m) && displayFV >= m) {
            reached.add(m);
            const years = Math.floor((monthsElapsed + 1) / 12);
            const months = (monthsElapsed + 1) % 12;
            newResults.push({ milestone: m, age: `${age + years} yr ${months} mo`, ageNum: age + years + months / 12 });
          }
        }
        monthsElapsed++;
        if (reached.size === milestones.length && currentAgeMarker > 60) break;
      }

      setResults(newResults.sort((a, b) => a.milestone - b.milestone));
      setAge50Value(tempAge50);
      setAge60Value(tempAge60);
      setChartData(newChartData);
      setIsCalculating(false);
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }, 500);
  };

  const calculateGap = () => {
    const cost = parseFloat(gapCost);
    if (isNaN(cost)) return;
    const r = (parseFloat(annualReturn) || 8) / 100;
    const years = (parseInt(projectUntilAge) || 90) - (parseInt(currentAge) || 27);
    const futureValue = cost * Math.pow(1 + r / 12, 12 * years);
    setGapResult({
      futureValue: Math.round(futureValue),
      cost: cost,
      difference: Math.round(futureValue - cost)
    });
  };

  return (
    <div className="min-h-screen text-white selection:bg-gold/30">
      <div className="gradient-mesh" />
      <header className="py-12 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-neutral-800 overflow-hidden shrink-0">
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: 'url(https://i.postimg.cc/8z4PqYSQ/518094566-1790413134729661.jpg)' }} 
              />
            </div>
            <h1 className="text-xl font-bold font-serif tracking-tight">
              <span className="text-white">Weston</span>
              <span className="text-gold ml-1">Invests</span>
            </h1>
          </div>
          <span className="text-neutral-500 text-sm font-medium">Blueprint</span>
        </div>
        <div className="max-w-2xl mx-auto mt-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-5 font-serif tracking-tight leading-tight">See When Your Money Starts Changing Your Life</h1>
            <p className="text-lg text-neutral-400 max-w-xl mx-auto leading-relaxed">Enter your numbers and see your estimated path to $100K, $250K, $500K, $1M and beyond.</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 -mt-16">
        <AnimatePresence>
          {showSticky && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 right-0 p-4 z-50"
            >
              <div className="max-w-3xl mx-auto bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl p-3 flex items-center justify-between gap-3">
                <div className='truncate'>
                  <p className="font-bold text-sm">Weston Wealth Blueprint</p>
                  <p className="text-[10px] text-neutral-400">$15 Founding Price</p>
                </div>
                <div className='flex items-center gap-3'>
                  <a href="https://payhip.com/b/yGO60" target="_blank" rel="noopener noreferrer" className="bg-linear-to-r from-emerald-deep to-gold text-white font-bold py-1.5 px-4 rounded-full text-xs">
                    VIEW BLUEPRINT
                  </a>
                  <button onClick={() => setIsDismissed(true)} className="text-neutral-500 hover:text-white">
                    <div className='w-5 h-5 flex items-center justify-center rounded-full bg-neutral-800'>
                        <Check className='rotate-45 w-3 h-3' />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-[24px] p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Current Age</label>
                <input type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Current Portfolio ($)</label>
                <input type="number" value={currentPortfolio} onChange={e => setCurrentPortfolio(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Monthly Investment ($)</label>
                <input type="number" value={monthlyInvestment} onChange={e => setMonthlyInvestment(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Expected Annual Return (%)</label>
                <input type="number" value={annualReturn} onChange={e => setAnnualReturn(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-white" />
              </div>
            </div>
            
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center text-emerald-400 mb-6 font-medium">
              Advanced settings {showAdvanced ? <ChevronUp className="ml-2 w-4 h-4"/> : <ChevronDown className="ml-2 w-4 h-4"/>}
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-neutral-800/50 rounded-2xl border border-neutral-700">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Annual Contribution Increase (%)</label>
                  <input type="number" value={annualIncrease} onChange={e => setAnnualIncrease(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Assumed Inflation (%)</label>
                  <input type="number" value={inflation} onChange={e => setInflation(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Project Until Age</label>
                  <input type="number" value={projectUntilAge} onChange={e => setProjectUntilAge(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-white" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={showInTodaysDollars} onChange={e => setShowInTodaysDollars(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
                  <label className="text-sm font-medium text-neutral-300">Show values in today's dollars</label>
                </div>
              </div>
            )}
            
            <button disabled={isCalculating} onClick={calculateWealth} className="w-full bg-linear-to-r from-emerald-deep to-gold text-white font-bold py-4 rounded-[24px] text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_0_15px_rgba(201,161,90,0.2)] hover:shadow-[0_0_25px_rgba(201,161,90,0.4)]">
              {isCalculating ? 'Calculating...' : 'BUILD MY WEALTH TIMELINE'}
            </button>
          
          <p className="text-center text-xs text-neutral-500 mt-6">
            Results are hypothetical estimates for educational purposes only, based on the numbers you enter. Investment returns are not guaranteed, markets fluctuate, and actual results will differ. This is not financial advice.
          </p>
        </div>

        {results && (
          <div ref={resultsRef} className="mt-12">
            <h2 className="text-3xl font-bold mb-2 font-serif">Your Projected Wealth Path</h2>
            <p className="text-neutral-400 mb-8">Assuming {annualReturn}% average annual return, compounded monthly{showInTodaysDollars ? ' (adjusted for inflation)' : ''}.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {results.slice(0, 3).map((r, i) => (
                <div key={i} className="bg-neutral-900/50 border border-neutral-700/50 rounded-[24px] p-6 shadow-md">
                  <p className="text-xs font-semibold text-neutral-400 tracking-widest uppercase">Age at ${r.milestone.toLocaleString()}</p>
                  <p className="text-2xl font-bold text-emerald-300 mt-1">{r.age}</p>
                </div>
              ))}
            </div>

            {/* Email Capture Card */}
            <AnimatePresence>
              {hasCalculated && !isReportUnlocked && (
                <motion.div
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <UnlockReport 
                    currentAge={currentAge}
                    currentPortfolio={currentPortfolio}
                    monthlyInvestment={monthlyInvestment}
                    annualReturn={annualReturn}
                    annualIncrease={annualIncrease}
                    inflation={inflation}
                    projectUntilAge={projectUntilAge}
                    showInTodaysDollars={showInTodaysDollars}
                    isUnlocked={isReportUnlocked}
                    onSuccess={(email) => {
                      setToast({ message: `We'll also send your wealth roadmap to ${email}.`, email });
                      setIsReportUnlocked(true);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Revealed section */}
            <motion.div 
                initial={false}
                animate={{ 
                    height: isReportUnlocked ? 'auto' : 0,
                    opacity: isReportUnlocked ? 1 : 0,
                    filter: isReportUnlocked ? 'blur(0px)' : 'blur(8px)',
                    pointerEvents: isReportUnlocked ? 'auto' : 'none'
                }}
                className="overflow-hidden"
              >

              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Million milestone card now here */}
                {results.length >= 4 && (
                    <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-[24px] p-6 shadow-md">
                      <p className="text-sm text-neutral-400">Age at ${results[3].milestone.toLocaleString()}</p>
                      <p className="text-2xl font-bold text-emerald-300 mt-1">{results[3].age}</p>
                    </div>
                )}
                {age50Value !== null && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                    <p className="text-sm text-neutral-400">Portfolio at age 50</p>
                    <p className="text-2xl font-bold text-emerald-300 mt-1">${Math.round(age50Value).toLocaleString()}</p>
                  </div>
                )}
                {age60Value !== null && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                    <p className="text-sm text-neutral-400">Portfolio at age 60</p>
                    <p className="text-2xl font-bold text-emerald-300 mt-1">${Math.round(age60Value).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 mb-12">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ChartIcon className="w-5 h-5 text-emerald-500" /> Portfolio growth</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 30, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.4} />
                      <XAxis 
                        dataKey="age" 
                        stroke="#666" 
                        interval={4} 
                        tick={{fontSize: 12}}
                      />
                      <YAxis 
                        stroke="#666" 
                        tickFormatter={(v) => v >= 1000000 ? `$${v / 1000000}M` : `$${v / 1000}K`}
                        tick={{fontSize: 12}}
                        tickCount={5}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', borderColor: '#333', borderRadius: '12px' }}
                        formatter={(value: number) => [
                          value >= 1000000 ? `$${(value / 1000000).toFixed(1).replace('.0', '')}M` : `$${(value / 1000).toFixed(0)}K`, 
                          'Value'
                        ]}
                        labelFormatter={(label) => `Age ${label}`}
                      />
                      <Legend />
                      {[100000, 250000, 500000, 1000000].map((m, i) => {
                          const dataPoint = chartData.find(d => d.portfolio >= m);
                          return dataPoint ? (
                            <ReferenceLine 
                              key={i} 
                              x={dataPoint.age} 
                              strokeDasharray="3 3" 
                              stroke="#c9a15a" 
                              strokeOpacity={0.6}
                              label={{ 
                                value: m >= 1000000 ? `$${m/1000000}M` : `$${m/1000}K`, 
                                position: 'top', 
                                fill: '#c9a15a', 
                                fontSize: 11,
                                fontWeight: 'bold',
                                offset: i % 2 === 0 ? 0 : 20 // Simple stagger
                              }} 
                            />
                          ) : null;
                      })}
                      <Area type="monotone" dataKey="portfolio" name="Projected portfolio" stroke="#10b981" fill="url(#colorPortfolio)" />
                      <Area type="monotone" dataKey="totalInvested" name="Total invested" stroke="#fbbf24" fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-[24px] p-8 mb-12 shadow-md">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gold">
                      <ArrowLeftRight className="w-5 h-5" /> The Quiet Wealth Gap
                  </h3>
                  <p className="text-neutral-300 mb-6">What did that almost-purchase actually cost you?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input type="text" placeholder="e.g. a car, a watch, a vacation" value={gapItem} onChange={e => setGapItem(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-white" />
                    <input type="number" placeholder="$" value={gapCost} onChange={e => setGapCost(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-white" />
                  </div>
                  <button onClick={calculateGap} className="w-full bg-linear-to-r from-emerald-deep to-gold text-white font-bold py-4 rounded-[24px] text-lg hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(201,161,90,0.2)]">
                    Reveal the real cost
                  </button>
                  {gapResult && (
                     <div className="mt-8 text-center space-y-2">
                       <p className="text-4xl font-bold text-white">${gapResult.futureValue.toLocaleString()}</p>
                       <p className="text-sm text-neutral-300">That's what your {gapItem || 'item'} would be worth by age {projectUntilAge} — if it had stayed invested instead.</p>
                       <p className="text-xs text-neutral-500">You didn't lose ${gapResult.cost.toLocaleString()}. You lost ${gapResult.difference.toLocaleString()} in future growth.</p>
                       <div className="pt-4 mt-4 border-t border-neutral-700">
                          <p className="text-amber-500 italic flex items-center justify-center gap-2 text-sm">
                            <ArrowDown className="w-4 h-4" /> This is exactly what the Blueprint helps you track and avoid — see how below ↓
                          </p>
                       </div>
                     </div>
                  )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-md bg-linear-to-br from-neutral-800 to-neutral-900">
                  <p className="text-sm text-neutral-400">Total Invested</p>
                  <p className="text-2xl font-bold text-white mt-1">${chartData[chartData.length - 1]?.totalInvested.toLocaleString()}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-md bg-linear-to-br from-neutral-800 to-neutral-900">
                  <p className="text-sm text-neutral-400">Growth Earned</p>
                  <p className="text-2xl font-bold text-white mt-1">${Math.max(0, chartData[chartData.length - 1]?.portfolio - chartData[chartData.length - 1]?.totalInvested).toLocaleString()}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-md bg-linear-to-br from-neutral-800 to-neutral-900">
                  <p className="text-sm text-neutral-400">Value at age {projectUntilAge}</p>
                  <p className="text-2xl font-bold text-white mt-1">${chartData[chartData.length - 1]?.portfolio.toLocaleString()}</p>
                </div>
              </div>
              
              {/* New Section */}
              <div className="mt-20 text-center space-y-6">
                <Sparkles className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-3xl font-bold">You now know your estimated path to $1M.</h3>
                <p className="text-neutral-400 max-w-xl mx-auto">The next step is turning that projection into a plan you can actually follow.</p>
                
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl bg-linear-to-br from-neutral-800 to-neutral-900 max-w-sm mx-auto">
                    <p className="text-xs font-semibold text-neutral-400 tracking-wide uppercase">YOUR CURRENT ESTIMATED $1M MILESTONE</p>
                    <p className="text-4xl font-bold text-amber-400 mt-2">{results[3]?.age || 'N/A'}</p>
                </div>

                <p className="max-w-2xl mx-auto">The Weston Invests Wealth Blueprint gives you the complete system to plan, track and stay consistent with that path.</p>
                
                <h4 className="text-2xl font-bold mt-12">This is for you if...</h4>
                <div className="space-y-4 mt-6 max-w-2xl mx-auto">
                    {[
                        "You understand investing, but still don't have a clear personal plan.",
                        "You keep watching finance content but aren't sure what your own numbers mean.",
                        "You want to build wealth without constantly changing strategy.",
                        "You want one simple place to plan and track your progress."
                    ].map((text, i) => (
                        <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-left">
                            {text}
                        </div>
                    ))}
                </div>
              </div>
              </motion.div>

              <div id="pricing" ref={pricingSectionRef} className="mt-20 max-w-2xl mx-auto mb-20">
                  <div className="flex justify-center mb-6">
                      <div className="flex items-center gap-2 px-4 py-1 rounded-full border border-gold/30 text-gold text-xs font-semibold">
                          <Sparkles className="w-3 h-3" /> FOUNDING PRICE
                      </div>
                  </div>
                  <h2 className="text-4xl font-bold font-serif text-center mb-2">Weston Wealth Blueprint</h2>
                  
                  <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-neutral-500 line-through text-lg">$25</span>
                      <span className="text-4xl font-bold text-gold">$15</span>
                      <span className="text-neutral-500 text-sm">one-time</span>
                  </div>
                  <p className="text-center text-neutral-400 mb-12">Save $10 during the founding launch.</p>

                  <div className="space-y-4 mb-8">
                      {[
                          { title: "Know exactly what you're working toward", sub: "Personal Wealth Roadmap + Milestone Tracker" },
                          { title: "See when your money could start doing more of the work", sub: "Compounding Crossover Calculator" },
                          { title: "Know whether you're actually progressing", sub: "Monthly Wealth Tracker" },
                          { title: "Picture your freedom in real, usable numbers", sub: "Financial Freedom Calculator" },
                          { title: "See what your near-misses really cost you", sub: "Quiet Wealth Gap Tracker" }
                      ].map((feat, i) => (
                          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-start gap-4">
                              <Check className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                              <div>
                                  <p className="font-bold">{feat.title}</p>
                                  <p className="text-sm text-neutral-400">{feat.sub}</p>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="text-center text-neutral-500 text-sm mb-8 flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" /> Lifetime access. No subscription.
                  </div>

                  <a href="https://payhip.com/b/yGO60" target="_blank" rel="noopener noreferrer" className="block text-center w-full bg-linear-to-r from-emerald-deep to-gold text-white font-bold py-4 rounded-[24px] text-lg hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(201,161,90,0.2)]">
                      GET THE BLUEPRINT — $15
                  </a>
                  <p className="text-center text-neutral-500 text-sm mt-4">Founding pricing will increase to $25.</p>
                  <p className="text-center text-neutral-600 text-xs mt-2">Educational products only. Not financial advice.</p>
              </div>
              
              <FAQ />

              <div className="mt-20 max-w-2xl mx-auto mb-20 bg-neutral-900/50 border border-neutral-700/50 rounded-[24px] p-8">
                <h2 className="text-4xl font-bold font-serif text-center mb-2">You Already Know the Numbers. Now Build the Plan.</h2>
                <p className="text-neutral-400 text-center mb-8">Turn your Wealth Report into a system you can follow month after month.</p>
                
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-neutral-500 line-through text-lg">$25</span>
                  <span className="text-4xl font-bold text-gold">$15</span>
                  <span className="text-gold text-xs font-bold uppercase tracking-wider border border-gold/30 rounded-full px-2 py-1">FOUNDING PRICE</span>
                </div>
                <p className="text-center text-neutral-500 text-sm mb-8">One payment · Lifetime access</p>

                <a 
                  href="https://payhip.com/b/yGO60" target="_blank" rel="noopener noreferrer"
                  className="block text-center w-full bg-linear-to-r from-emerald-deep to-gold text-white font-bold py-4 rounded-[24px] text-lg hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(201,161,90,0.2)]"
                >
                  BUILD MY WEALTH PLAN — $15
                </a>
              </div>

              <div className="border-t border-neutral-800 pt-12 pb-8 text-center px-6">
                <p className="text-sm text-neutral-500 max-w-2xl mx-auto mb-4">
                  Weston Invests provides educational tools and content. Projections are hypothetical, assume a constant rate of return, and do not account for taxes, fees or market volatility. Past performance does not guarantee future results.
                </p>
                <p className="text-xs text-neutral-600">© 2026 Weston Invests</p>
              </div>
          </div>
        )}
        {toast && (
          <div className="fixed bottom-6 left-6 right-6 bg-white text-neutral-950 p-6 rounded-3xl shadow-2xl flex items-start gap-4 animate-slide-up">
            <div className="bg-emerald-500 text-white p-2 rounded-full"><Check /></div>
            <div>
              <p className="font-bold">Full report unlocked</p>
              <p className="text-sm text-neutral-700">{toast.message}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

