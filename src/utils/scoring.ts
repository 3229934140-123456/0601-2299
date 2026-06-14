import type { GradeLevel, Gender, TestProject } from "@/types";

export interface ScoringThreshold {
  projectId: string;
  gender: Gender;
  ageRange: [number, number];
  rows: {
    points: number;
    grade: GradeLevel;
    value: number;
  }[];
  direction: "lowerBetter" | "higherBetter";
}

const TIMING_LOWER = "lowerBetter";
const HIGHER = "higherBetter";

export const SCORING_TABLES: ScoringThreshold[] = [
  {
    projectId: "p_50m",
    gender: "male",
    ageRange: [15, 19],
    direction: TIMING_LOWER,
    rows: [
      { points: 100, grade: "excellent", value: 7.1 },
      { points: 95, grade: "excellent", value: 7.3 },
      { points: 90, grade: "excellent", value: 7.5 },
      { points: 85, grade: "good", value: 7.7 },
      { points: 80, grade: "good", value: 7.9 },
      { points: 75, grade: "good", value: 8.1 },
      { points: 70, grade: "pass", value: 8.4 },
      { points: 65, grade: "pass", value: 8.7 },
      { points: 60, grade: "pass", value: 9.1 },
      { points: 50, grade: "fail", value: 10.5 },
    ],
  },
  {
    projectId: "p_50m",
    gender: "female",
    ageRange: [15, 19],
    direction: TIMING_LOWER,
    rows: [
      { points: 100, grade: "excellent", value: 7.7 },
      { points: 95, grade: "excellent", value: 7.9 },
      { points: 90, grade: "excellent", value: 8.1 },
      { points: 85, grade: "good", value: 8.3 },
      { points: 80, grade: "good", value: 8.5 },
      { points: 75, grade: "good", value: 8.7 },
      { points: 70, grade: "pass", value: 9.2 },
      { points: 65, grade: "pass", value: 9.7 },
      { points: 60, grade: "pass", value: 10.3 },
      { points: 50, grade: "fail", value: 12.0 },
    ],
  },
  {
    projectId: "p_1000m",
    gender: "male",
    ageRange: [15, 19],
    direction: TIMING_LOWER,
    rows: [
      { points: 100, grade: "excellent", value: 215 },
      { points: 95, grade: "excellent", value: 225 },
      { points: 90, grade: "excellent", value: 235 },
      { points: 85, grade: "good", value: 245 },
      { points: 80, grade: "good", value: 255 },
      { points: 75, grade: "good", value: 265 },
      { points: 70, grade: "pass", value: 280 },
      { points: 65, grade: "pass", value: 295 },
      { points: 60, grade: "pass", value: 310 },
      { points: 50, grade: "fail", value: 350 },
    ],
  },
  {
    projectId: "p_800m",
    gender: "female",
    ageRange: [15, 19],
    direction: TIMING_LOWER,
    rows: [
      { points: 100, grade: "excellent", value: 190 },
      { points: 95, grade: "excellent", value: 200 },
      { points: 90, grade: "excellent", value: 210 },
      { points: 85, grade: "good", value: 220 },
      { points: 80, grade: "good", value: 230 },
      { points: 75, grade: "good", value: 240 },
      { points: 70, grade: "pass", value: 255 },
      { points: 65, grade: "pass", value: 270 },
      { points: 60, grade: "pass", value: 285 },
      { points: 50, grade: "fail", value: 320 },
    ],
  },
  {
    projectId: "p_long_jump",
    gender: "male",
    ageRange: [15, 19],
    direction: HIGHER,
    rows: [
      { points: 100, grade: "excellent", value: 255 },
      { points: 95, grade: "excellent", value: 245 },
      { points: 90, grade: "excellent", value: 235 },
      { points: 85, grade: "good", value: 225 },
      { points: 80, grade: "good", value: 215 },
      { points: 75, grade: "good", value: 205 },
      { points: 70, grade: "pass", value: 195 },
      { points: 65, grade: "pass", value: 185 },
      { points: 60, grade: "pass", value: 175 },
      { points: 50, grade: "fail", value: 150 },
    ],
  },
  {
    projectId: "p_long_jump",
    gender: "female",
    ageRange: [15, 19],
    direction: HIGHER,
    rows: [
      { points: 100, grade: "excellent", value: 207 },
      { points: 95, grade: "excellent", value: 200 },
      { points: 90, grade: "excellent", value: 193 },
      { points: 85, grade: "good", value: 186 },
      { points: 80, grade: "good", value: 179 },
      { points: 75, grade: "good", value: 172 },
      { points: 70, grade: "pass", value: 164 },
      { points: 65, grade: "pass", value: 156 },
      { points: 60, grade: "pass", value: 148 },
      { points: 50, grade: "fail", value: 120 },
    ],
  },
  {
    projectId: "p_sit_up",
    gender: "male",
    ageRange: [15, 19],
    direction: HIGHER,
    rows: [
      { points: 100, grade: "excellent", value: 54 },
      { points: 95, grade: "excellent", value: 50 },
      { points: 90, grade: "excellent", value: 46 },
      { points: 85, grade: "good", value: 43 },
      { points: 80, grade: "good", value: 40 },
      { points: 75, grade: "good", value: 37 },
      { points: 70, grade: "pass", value: 34 },
      { points: 65, grade: "pass", value: 31 },
      { points: 60, grade: "pass", value: 28 },
      { points: 50, grade: "fail", value: 18 },
    ],
  },
  {
    projectId: "p_sit_up",
    gender: "female",
    ageRange: [15, 19],
    direction: HIGHER,
    rows: [
      { points: 100, grade: "excellent", value: 52 },
      { points: 95, grade: "excellent", value: 48 },
      { points: 90, grade: "excellent", value: 44 },
      { points: 85, grade: "good", value: 41 },
      { points: 80, grade: "good", value: 38 },
      { points: 75, grade: "good", value: 35 },
      { points: 70, grade: "pass", value: 32 },
      { points: 65, grade: "pass", value: 29 },
      { points: 60, grade: "pass", value: 26 },
      { points: 50, grade: "fail", value: 16 },
    ],
  },
  {
    projectId: "p_pull_up",
    gender: "male",
    ageRange: [15, 19],
    direction: HIGHER,
    rows: [
      { points: 100, grade: "excellent", value: 17 },
      { points: 95, grade: "excellent", value: 15 },
      { points: 90, grade: "excellent", value: 13 },
      { points: 85, grade: "good", value: 12 },
      { points: 80, grade: "good", value: 11 },
      { points: 75, grade: "good", value: 10 },
      { points: 70, grade: "pass", value: 9 },
      { points: 65, grade: "pass", value: 8 },
      { points: 60, grade: "pass", value: 7 },
      { points: 50, grade: "fail", value: 3 },
    ],
  },
  {
    projectId: "p_sit_reach",
    gender: "male",
    ageRange: [15, 19],
    direction: HIGHER,
    rows: [
      { points: 100, grade: "excellent", value: 22 },
      { points: 95, grade: "excellent", value: 20 },
      { points: 90, grade: "excellent", value: 18 },
      { points: 85, grade: "good", value: 16 },
      { points: 80, grade: "good", value: 14 },
      { points: 75, grade: "good", value: 12 },
      { points: 70, grade: "pass", value: 9 },
      { points: 65, grade: "pass", value: 6 },
      { points: 60, grade: "pass", value: 3 },
      { points: 50, grade: "fail", value: -2 },
    ],
  },
  {
    projectId: "p_sit_reach",
    gender: "female",
    ageRange: [15, 19],
    direction: HIGHER,
    rows: [
      { points: 100, grade: "excellent", value: 25 },
      { points: 95, grade: "excellent", value: 23 },
      { points: 90, grade: "excellent", value: 21 },
      { points: 85, grade: "good", value: 19 },
      { points: 80, grade: "good", value: 17 },
      { points: 75, grade: "good", value: 15 },
      { points: 70, grade: "pass", value: 12 },
      { points: 65, grade: "pass", value: 9 },
      { points: 60, grade: "pass", value: 6 },
      { points: 50, grade: "fail", value: 1 },
    ],
  },
  {
    projectId: "p_vital",
    gender: "male",
    ageRange: [15, 19],
    direction: HIGHER,
    rows: [
      { points: 100, grade: "excellent", value: 5200 },
      { points: 95, grade: "excellent", value: 4900 },
      { points: 90, grade: "excellent", value: 4600 },
      { points: 85, grade: "good", value: 4300 },
      { points: 80, grade: "good", value: 4000 },
      { points: 75, grade: "good", value: 3700 },
      { points: 70, grade: "pass", value: 3400 },
      { points: 65, grade: "pass", value: 3100 },
      { points: 60, grade: "pass", value: 2800 },
      { points: 50, grade: "fail", value: 2200 },
    ],
  },
  {
    projectId: "p_vital",
    gender: "female",
    ageRange: [15, 19],
    direction: HIGHER,
    rows: [
      { points: 100, grade: "excellent", value: 3600 },
      { points: 95, grade: "excellent", value: 3400 },
      { points: 90, grade: "excellent", value: 3200 },
      { points: 85, grade: "good", value: 3000 },
      { points: 80, grade: "good", value: 2800 },
      { points: 75, grade: "good", value: 2600 },
      { points: 70, grade: "pass", value: 2400 },
      { points: 65, grade: "pass", value: 2200 },
      { points: 60, grade: "pass", value: 2000 },
      { points: 50, grade: "fail", value: 1600 },
    ],
  },
  {
    projectId: "p_bmi",
    gender: "male",
    ageRange: [15, 19],
    direction: HIGHER,
    rows: [
      { points: 100, grade: "excellent", value: 22 },
      { points: 90, grade: "excellent", value: 20 },
      { points: 80, grade: "good", value: 18.5 },
      { points: 70, grade: "pass", value: 17 },
      { points: 60, grade: "pass", value: 16 },
      { points: 50, grade: "fail", value: 15 },
    ],
  },
  {
    projectId: "p_bmi",
    gender: "female",
    ageRange: [15, 19],
    direction: HIGHER,
    rows: [
      { points: 100, grade: "excellent", value: 21 },
      { points: 90, grade: "excellent", value: 19.5 },
      { points: 80, grade: "good", value: 18 },
      { points: 70, grade: "pass", value: 16.5 },
      { points: 60, grade: "pass", value: 15.5 },
      { points: 50, grade: "fail", value: 14.5 },
    ],
  },
];

export function getThresholds(projectId: string, gender: Gender) {
  return SCORING_TABLES.find((t) => t.projectId === projectId && t.gender === gender);
}

export interface CalcResult {
  points: number;
  grade: GradeLevel;
  isAbnormal: boolean;
}

export function calculateScore(
  projectId: string,
  gender: Gender,
  _age: number,
  score: number,
  project?: TestProject
): CalcResult {
  const table = getThresholds(projectId, gender);

  let isAbnormal = false;
  if (project) {
    if (score < project.minValid || score > project.maxValid) {
      isAbnormal = true;
    }
  }

  if (!table || !table.rows.length) {
    const pts = Math.min(100, Math.max(50, Math.round(55 + Math.random() * 40)));
    let g: GradeLevel = "pass";
    if (pts >= 90) g = "excellent";
    else if (pts >= 80) g = "good";
    else if (pts >= 60) g = "pass";
    else g = "fail";
    return { points: pts, grade: g, isAbnormal };
  }

  const rows = [...table.rows].sort((a, b) =>
    table.direction === "lowerBetter" ? a.value - b.value : b.value - a.value
  );

  let hit = rows[rows.length - 1];
  if (table.direction === "lowerBetter") {
    for (const r of rows) {
      if (score <= r.value) {
        hit = r;
        break;
      }
    }
  } else {
    for (const r of rows) {
      if (score >= r.value) {
        hit = r;
        break;
      }
    }
  }

  if (!isAbnormal) {
    const last = rows[rows.length - 1];
    const first = rows[0];
    if (table.direction === "lowerBetter") {
      if (score > last.value * 1.2) isAbnormal = true;
      if (score > 0 && score < first.value * 0.75) isAbnormal = true;
    } else {
      if (score < last.value * 0.5 && score > 0) isAbnormal = true;
      if (score > first.value * 1.3) isAbnormal = true;
    }
  }

  return { points: hit.points, grade: hit.grade, isAbnormal };
}

export function pointsToGrade(points: number): GradeLevel {
  if (points >= 90) return "excellent";
  if (points >= 80) return "good";
  if (points >= 60) return "pass";
  return "fail";
}
