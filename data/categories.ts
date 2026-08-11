import type { Category } from "@/types";

export const categories: Category[] = [
  {
    slug: "slots",
    name: "Slots",
    description:
      "Reel-based games from classic three-reel machines to feature-packed video slots and progressive jackpots.",
    icon: "Dices",
    accent: "primary",
  },
  {
    slug: "live-casino",
    name: "Live Casino",
    description:
      "Real dealers streamed in HD — blackjack, baccarat and game shows played in real time from studio floors.",
    icon: "Video",
    accent: "gold",
  },
  {
    slug: "sports-betting",
    name: "Sports Betting",
    description:
      "Pre-match and in-play odds across football, basketball, tennis, esports and more, built for mobile.",
    icon: "Trophy",
    accent: "primary",
  },
  {
    slug: "poker",
    name: "Poker",
    description:
      "Cash games, sit-and-go and tournament apps with fast tables and multi-table support.",
    icon: "Diamond",
    accent: "gold",
  },
  {
    slug: "blackjack",
    name: "Blackjack",
    description:
      "Single-hand, multi-hand and side-bet blackjack with clear rules and low house-edge variants.",
    icon: "Shuffle",
    accent: "primary",
  },
  {
    slug: "roulette",
    name: "Roulette",
    description:
      "European, American and lightning roulette with configurable table limits and racetrack betting.",
    icon: "Orbit",
    accent: "gold",
  },
  {
    slug: "crash-games",
    name: "Crash Games",
    description:
      "Fast, provably-fair multiplier games where cashing out before the crash is the whole game.",
    icon: "Zap",
    accent: "primary",
  },
  {
    slug: "bingo",
    name: "Bingo",
    description:
      "90-ball, 75-ball and speed bingo rooms with chat, side games and community jackpots.",
    icon: "Target",
    accent: "gold",
  },
];
