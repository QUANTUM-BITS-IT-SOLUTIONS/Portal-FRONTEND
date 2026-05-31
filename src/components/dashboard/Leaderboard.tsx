import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, TrendingUp, Gift, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface LeaderboardEntry {
  rank: number;
  name: string;
  university: string;
  earnings: number;
  clients: number;
  isCurrentUser?: boolean;
}

// const leaderboardData: LeaderboardEntry[] = [
//   { rank: 1, name: 'Arjun Sharma', university: 'IIT Delhi', earnings: 42580, clients: 28 },
//   { rank: 2, name: 'Priya Patel', university: 'IIT Bombay', earnings: 38120, clients: 24 },
//   { rank: 3, name: 'Rahul Verma', university: 'IIT Madras', earnings: 31450, clients: 21 },
//   { rank: 4, name: 'Sneha Gupta', university: 'BITS Pilani', earnings: 28900, clients: 19 },
//   { rank: 5, name: 'Vikram Singh', university: 'IIT Kanpur', earnings: 20252, clients: 15, isCurrentUser: true },
//   { rank: 6, name: 'Ananya Reddy', university: 'NIT Trichy', earnings: 18600, clients: 14 },
//   { rank: 7, name: 'Karan Mehta', university: 'IIIT Hyderabad', earnings: 16200, clients: 12 },
//   { rank: 8, name: 'Neha Joshi', university: 'VIT Vellore', earnings: 14850, clients: 11 },
// ];

const monthlyRewards = [
  { rank: 1, reward: '₹10,000 Bonus', icon: Crown },
  { rank: 2, reward: '₹5,000 Bonus ', icon: Medal },
  { rank: 3, reward: '₹2,500 Bonus', icon: Award },
];

interface LeaderboardProps {
  delay?: number;
}

export const Leaderboard = ({ delay = 0 }: LeaderboardProps) => {
  const { data: leaderboardData = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await api.get('/students/leaderboard');
      return data as LeaderboardEntry[];
    }
  });
  const currentUser = leaderboardData.find(e => e.isCurrentUser);
  const nextRankUser = currentUser ? leaderboardData.find(e => e.rank === currentUser.rank - 1) : null;

  const amountToNextRank = nextRankUser && currentUser
    ? nextRankUser.earnings - currentUser.earnings
    : 0;

  const progressToNextRank = nextRankUser && currentUser
    ? ((currentUser.earnings) / (nextRankUser.earnings)) * 100
    : 100;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-warning" size={20} />;
      case 2:
        return <Medal className="text-muted-foreground" size={20} />;
      case 3:
        return <Award className="text-amber-600" size={20} />;
      default:
        return <span className="w-5 text-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-warning/10 border-warning/30';
      case 2:
        return 'bg-muted/70 border-muted-foreground/20';
      case 3:
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-card border-border';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-warning/10">
            <Trophy className="text-warning w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-display text-foreground">Top Partners</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">This month's leaderboard</p>
          </div>
        </div>
      </div>

      {/* Progress to Next Rank */}
      {currentUser && nextRankUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.1 }}
          className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-accent/5 border border-accent/20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Your Progress to Rank #{currentUser.rank - 1}</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-accent">
              {formatCurrency(amountToNextRank)} to go
            </span>
          </div>
          <Progress value={progressToNextRank} className="h-2 sm:h-3" />
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
            Earn {formatCurrency(amountToNextRank)} more this month to overtake {nextRankUser.name}
          </p>
        </motion.div>
      )}

      {/* Monthly Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.15 }}
        className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-warning/10 via-warning/5 to-transparent border border-warning/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-warning" />
          <span className="text-xs sm:text-sm font-medium text-foreground">Monthly Rewards</span>
        </div>
        <div className="space-y-2">
          {monthlyRewards.map((reward, index) => (
            <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
              <reward.icon className={cn(
                "w-3.5 h-3.5",
                index === 0 ? "text-warning" : index === 1 ? "text-muted-foreground" : "text-amber-600"
              )} />
              <span className="text-muted-foreground">#{reward.rank}:</span>
              <span className="text-foreground font-medium">{reward.reward}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="space-y-2 sm:space-y-3">
        {leaderboardData.map((entry, index) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.05 * index }}
            className={cn(
              "flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg border transition-all",
              getRankBg(entry.rank),
              entry.isCurrentUser && "ring-2 ring-accent ring-offset-1 sm:ring-offset-2"
            )}
          >
            <div className="w-6 sm:w-8 flex justify-center flex-shrink-0">
              {getRankIcon(entry.rank)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <p className="font-medium text-foreground text-sm sm:text-base truncate">
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-accent text-accent-foreground px-1 sm:px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{entry.university}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="font-bold text-foreground font-display text-sm sm:text-base">
                {formatCurrency(entry.earnings)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{entry.clients} active leads</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivational Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5 }}
        className="mt-4 pt-4 border-t border-border"
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Star className="w-4 h-4 text-warning" />
          <span>Top 3 partners receive exclusive rewards every month!</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
