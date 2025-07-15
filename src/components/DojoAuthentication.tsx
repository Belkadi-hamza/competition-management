import React, { useState, useEffect } from 'react';
import { Shield, Trophy, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface BeltRank {
  level: string;
  color: string;
  bgColor: string;
  permissions: string[];
}

interface BracketPosition {
  id: string;
  position: number;
  selected: boolean;
  correctOrder: number;
}

const DojoAuthentication: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'belt' | 'pattern' | 'code' | 'success'>('belt');
  const [selectedBelt, setSelectedBelt] = useState<string>('');
  const [bracketPattern, setBracketPattern] = useState<BracketPosition[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [dojoCode, setDojoCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const beltRanks: BeltRank[] = [
    {
      level: 'White Belt',
      color: 'text-gray-800',
      bgColor: 'bg-white border-gray-300',
      permissions: ['View tournaments', 'Basic reporting']
    },
    {
      level: 'Yellow Belt',
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-100 border-yellow-300',
      permissions: ['Manage participants', 'Create categories']
    },
    {
      level: 'Green Belt',
      color: 'text-green-800',
      bgColor: 'bg-green-100 border-green-300',
      permissions: ['Tournament setup', 'Match scheduling']
    },
    {
      level: 'Blue Belt',
      color: 'text-blue-800',
      bgColor: 'bg-blue-100 border-blue-300',
      permissions: ['Full tournament management', 'Results processing']
    },
    {
      level: 'Red Belt',
      color: 'text-red-800',
      bgColor: 'bg-red-100 border-red-300',
      permissions: ['Multi-tournament oversight', 'Advanced analytics']
    },
    {
      level: 'Black Belt',
      color: 'text-white',
      bgColor: 'bg-gray-900 border-gray-700',
      permissions: ['System administration', 'User management', 'All features']
    }
  ];

  const generateBracketPattern = (difficulty: number) => {
    const positions = Array.from({ length: difficulty * 2 }, (_, i) => ({
      id: `pos-${i}`,
      position: i,
      selected: false,
      correctOrder: Math.floor(Math.random() * difficulty * 2)
    }));
    
    // Ensure unique correct orders
    const shuffled = [...Array(difficulty * 2).keys()].sort(() => Math.random() - 0.5);
    positions.forEach((pos, idx) => {
      pos.correctOrder = shuffled[idx];
    });
    
    return positions.sort((a, b) => a.correctOrder - b.correctOrder);
  };

  const generateDojoCode = () => {
    const techniques = ['KICK', 'FORM', 'BLOCK', 'PUNCH', 'JUMP', 'SPIN'];
    const technique = techniques[Math.floor(Math.random() * techniques.length)];
    const number = Math.floor(Math.random() * 900) + 100;
    return `${technique}-${number}`;
  };

  const getBeltDifficulty = (belt: string) => {
    const difficulties = {
      'White Belt': 2,
      'Yellow Belt': 3,
      'Green Belt': 4,
      'Blue Belt': 5,
      'Red Belt': 6,
      'Black Belt': 8
    };
    return difficulties[belt as keyof typeof difficulties] || 2;
  };

  const handleBeltSelection = (belt: string) => {
    setSelectedBelt(belt);
    const difficulty = getBeltDifficulty(belt);
    setBracketPattern(generateBracketPattern(difficulty));
    setCurrentStep('pattern');
  };

  const handlePatternClick = (position: BracketPosition) => {
    if (userPattern.length < bracketPattern.length) {
      const newPattern = [...userPattern, position.correctOrder];
      setUserPattern(newPattern);
      
      setBracketPattern(prev => 
        prev.map(p => 
          p.id === position.id ? { ...p, selected: true } : p
        )
      );

      if (newPattern.length === bracketPattern.length) {
        // Check if pattern is correct
        const isCorrect = newPattern.every((order, idx) => order === idx);
        if (isCorrect) {
          setDojoCode(generateDojoCode());
          setCurrentStep('code');
          setTimeRemaining(90);
        } else {
          setAttempts(prev => prev + 1);
          if (attempts >= 2) {
            setIsLocked(true);
            setTimeout(() => {
              setIsLocked(false);
              setAttempts(0);
            }, 300000); // 5 minutes
          }
          // Reset pattern
          setBracketPattern(generateBracketPattern(getBeltDifficulty(selectedBelt)));
          setUserPattern([]);
        }
      }
    }
  };

  const handleCodeSubmit = () => {
    if (inputCode === dojoCode) {
      setCurrentStep('success');
    } else {
      setAttempts(prev => prev + 1);
      setInputCode('');
      if (attempts >= 2) {
        setIsLocked(true);
      }
    }
  };

  useEffect(() => {
    if (currentStep === 'code' && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      setDojoCode(generateDojoCode());
      setTimeRemaining(90);
    }
  }, [currentStep, timeRemaining]);

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dojo Locked</h2>
          <p className="text-gray-600 mb-4">
            Too many failed attempts. Please wait for the round break to end.
          </p>
          <div className="text-sm text-gray-500">
            Training resumes in 5 minutes
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Dojo Guardian</h1>
              <p className="text-red-100">TKD Competition Management Authentication</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStep === 'belt' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Select Your Belt Rank
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {beltRanks.map((belt) => (
                  <button
                    key={belt.level}
                    onClick={() => handleBeltSelection(belt.level)}
                    className={`p-4 border-2 rounded-lg transition-all hover:scale-105 ${belt.bgColor} ${belt.color}`}
                  >
                    <div className="text-center">
                      <div className="font-bold text-lg mb-2">{belt.level}</div>
                      <div className="text-sm opacity-75">
                        {belt.permissions.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'pattern' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Complete the Tournament Pattern
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Select the positions in ascending order (0, 1, 2, 3...)
              </p>
              <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                {bracketPattern.map((position) => (
                  <button
                    key={position.id}
                    onClick={() => handlePatternClick(position)}
                    disabled={position.selected}
                    className={`aspect-square border-2 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                      position.selected
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-gray-50 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {position.selected ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Trophy className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
              <div className="text-center mt-4 text-sm text-gray-500">
                Progress: {userPattern.length}/{bracketPattern.length}
              </div>
            </div>
          )}

          {currentStep === 'code' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Enter Your Dojo Code
              </h2>
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="font-mono text-lg font-bold">{dojoCode}</span>
                </div>
              </div>
              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Enter code..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCodeSubmit}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Authenticate
                </button>
              </div>
              <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Code expires in {timeRemaining}s</span>
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Welcome to the Dojo!
              </h2>
              <p className="text-gray-600 mb-6">
                Authentication successful. You have {selectedBelt} access level.
              </p>
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                Enter Tournament Management
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-500">
          Secured by Dojo Guardian • {attempts}/3 attempts used
        </div>
      </div>
    </div>
  );
};

export default DojoAuthentication;