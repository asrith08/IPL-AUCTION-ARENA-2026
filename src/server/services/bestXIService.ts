import { Player, SquadPlayer, TeamAnalysisScore } from "../../types/index.ts";

export function calculateBestXIAndAnalysis(
  userId: string,
  teamName: string,
  squad: SquadPlayer[],
  userSelectedXIIds?: string[]
): TeamAnalysisScore {
  const players = squad.map((s) => s.player);

  if (players.length === 0) {
    return {
      userId,
      teamName,
      overallScore: 0,
      battingScore: 0,
      bowlingScore: 0,
      openersScore: 0,
      middleOrderScore: 0,
      finishingScore: 0,
      paceScore: 0,
      spinScore: 0,
      wicketkeepingScore: 0,
      captainScore: 0,
      benchScore: 0,
      overseasBalanceScore: 0,
      strengths: ["No players purchased yet"],
      weaknesses: ["Empty squad"],
      verdict: "Need to purchase players during the auction.",
      bestXI: [],
      userXI: [],
    };
  }

  // Best XI Selection Algorithm
  // 1. Sort squad by overall rating
  const sorted = [...players].sort((a, b) => b.overallRating - a.overallRating);

  // Separate overseas vs Indian
  const overseas = sorted.filter((p) => p.isOverseas);
  const indians = sorted.filter((p) => !p.isOverseas);

  const bestXI: Player[] = [];
  let overseasCount = 0;

  // Ensure 1 Wicketkeeper first
  const topWK = sorted.find((p) => p.canKeepWickets || p.role === "WK");
  if (topWK) {
    bestXI.push(topWK);
    if (topWK.isOverseas) overseasCount++;
  }

  // Ensure at least 2 Bowlers/All-rounders with good bowling
  const bowlers = sorted.filter(
    (p) => !bestXI.some((b) => b.id === p.id) && (p.role === "BOWL" || p.role === "AR")
  );

  for (const b of bowlers) {
    if (bestXI.length >= 11) break;
    if (b.isOverseas && overseasCount >= 4) continue;
    bestXI.push(b);
    if (b.isOverseas) overseasCount++;
    if (bestXI.filter((p) => p.role === "BOWL" || p.role === "AR").length >= 5) break;
  }

  // Fill remaining spots with highest rated available players under overseas limit
  for (const p of sorted) {
    if (bestXI.length >= 11) break;
    if (bestXI.some((b) => b.id === p.id)) continue;
    if (p.isOverseas && overseasCount >= 4) continue;

    bestXI.push(p);
    if (p.isOverseas) overseasCount++;
  }

  // If still less than 11 due to overseas restriction, fill with remaining Indians
  if (bestXI.length < 11) {
    for (const p of indians) {
      if (bestXI.length >= 11) break;
      if (!bestXI.some((b) => b.id === p.id)) {
        bestXI.push(p);
      }
    }
  }

  // User selected XI (or fallback to Best XI)
  let userXI: Player[] = [];
  if (userSelectedXIIds && userSelectedXIIds.length > 0) {
    userXI = players.filter((p) => userSelectedXIIds.includes(p.id));
  }
  if (userXI.length === 0) {
    userXI = [...bestXI];
  }

  // Calculations for scores
  const avgBatting =
    bestXI.reduce((acc, p) => acc + p.battingRating, 0) / (bestXI.length || 1);
  const avgBowling =
    bestXI.reduce((acc, p) => acc + p.bowlingRating, 0) / (bestXI.length || 1);

  // Openers score (top 2 rated batters)
  const openers = [...bestXI]
    .sort((a, b) => b.battingRating - a.battingRating)
    .slice(0, 2);
  const openersScore = Math.round(
    openers.reduce((acc, p) => acc + p.battingRating, 0) / (openers.length || 1)
  );

  // Middle order score (ranks 3-5 batters)
  const middleOrder = [...bestXI]
    .sort((a, b) => b.battingRating - a.battingRating)
    .slice(2, 6);
  const middleOrderScore = Math.round(
    middleOrder.reduce((acc, p) => acc + p.battingRating, 0) / (middleOrder.length || 1)
  );

  // Finishing score (high impact ratings among lower/middle order)
  const finishers = [...bestXI]
    .sort((a, b) => b.impactRating - a.impactRating)
    .slice(0, 3);
  const finishingScore = Math.round(
    finishers.reduce((acc, p) => acc + p.impactRating, 0) / (finishers.length || 1)
  );

  // Pace vs Spin
  const paceBowlers = bestXI.filter((p) => p.role === "BOWL" || p.role === "AR");
  const paceScore = Math.min(
    100,
    Math.round(
      paceBowlers.reduce((acc, p) => acc + p.bowlingRating, 0) / (paceBowlers.length || 1) +
        (paceBowlers.length >= 3 ? 5 : -5)
    )
  );

  const spinScore = Math.min(
    100,
    Math.round(
      paceBowlers.reduce((acc, p) => acc + p.bowlingRating, 0) / (paceBowlers.length || 1)
    )
  );

  const wk = bestXI.find((p) => p.canKeepWickets || p.role === "WK");
  const wicketkeepingScore = wk ? wk.wicketkeepingRating : 40;

  const captain = bestXI.find((p) => p.experienceRating > 90) || bestXI[0];
  const captainScore = captain ? captain.experienceRating : 75;

  // Bench strength (players not in best XI)
  const bench = players.filter((p) => !bestXI.some((b) => b.id === p.id));
  const benchScore = Math.min(
    100,
    Math.round(
      (bench.reduce((acc, p) => acc + p.overallRating, 0) / (bench.length || 1)) *
        (bench.length >= 4 ? 1.05 : 0.85)
    )
  );

  const totalOverseasInSquad = players.filter((p) => p.isOverseas).length;
  const overseasBalanceScore =
    totalOverseasInSquad >= 4 && totalOverseasInSquad <= 8 ? 95 : 70;

  // Overall Score Calculation
  const battingScore = Math.round(avgBatting);
  const bowlingScore = Math.round(avgBowling);

  const overallScore = Math.round(
    battingScore * 0.25 +
      bowlingScore * 0.25 +
      openersScore * 0.1 +
      middleOrderScore * 0.1 +
      finishingScore * 0.1 +
      wicketkeepingScore * 0.05 +
      benchScore * 0.05 +
      overseasBalanceScore * 0.1
  );

  // Strengths & Weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (battingScore >= 88) strengths.push("Powerful & deep batting lineup");
  if (bowlingScore >= 88) strengths.push("Elite, wicket-taking bowling attack");
  if (openersScore >= 90) strengths.push("Explosive top-order openers");
  if (finishingScore >= 90) strengths.push("World-class match finishers");
  if (wicketkeepingScore >= 90) strengths.push("Top-tier wicketkeeping quality");
  if (benchScore >= 85) strengths.push("Strong backup bench depth for injuries");

  if (battingScore < 82) weaknesses.push("Batting depth could be vulnerable");
  if (bowlingScore < 82) weaknesses.push("Bowling attack lacks lethal wicket-takers");
  if (!wk) weaknesses.push("No specialist wicketkeeper in Best XI");
  if (bench.length < 3) weaknesses.push("Thin bench strength for rotation");
  if (totalOverseasInSquad < 4) weaknesses.push("Underutilized overseas player quota");

  if (strengths.length === 0) strengths.push("Balanced squad composition");
  if (weaknesses.length === 0) weaknesses.push("Minor role overlap in middle order");

  const verdict =
    overallScore >= 90
      ? titleVerdict("Title Contender", teamName, overallScore)
      : overallScore >= 82
      ? titleVerdict("Strong Playoff Contender", teamName, overallScore)
      : titleVerdict("Competitive Mid-Table Team", teamName, overallScore);

  return {
    userId,
    teamName,
    overallScore,
    battingScore,
    bowlingScore,
    openersScore,
    middleOrderScore,
    finishingScore,
    paceScore,
    spinScore,
    wicketkeepingScore,
    captainScore,
    benchScore,
    overseasBalanceScore,
    strengths,
    weaknesses,
    verdict,
    bestXI,
    userXI,
  };
}

function titleVerdict(tier: string, team: string, score: number): string {
  return `${team} is rated as a ${tier} (${score}/100) with well-distributed power across core roles and tactical flexibility.`;
}
