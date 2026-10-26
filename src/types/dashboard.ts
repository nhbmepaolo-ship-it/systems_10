export interface System2Row {
  month: string;
  date: string;
  time: string;
  isUrgent: boolean;
  isInfo: boolean;
  isSpirit: boolean;
  freqDaily: boolean;
  freqWeekly: boolean;
  freqMonthly: boolean;
  freqYearly: boolean;
  commType: string;
  content: string;
  speaker: string;
  channelMSTeams: boolean;
  channelMorning: boolean;
  channelVoice: boolean;
  channelLine: boolean;
  channelOther: boolean;
  ackRatePercent: number; // e.g. 71.43
  supervisor: string;
  duration: string;
  responsible: string;
  monitorQuiz: boolean;
  monitorStory: boolean;
  monitorLine: boolean;
  note: string;
}

export interface System5Row {
  month: string;
  date: string;
  time: string;
  department: string;
  channelRound: boolean;
  channelPhone: boolean;
  channelWeb: boolean;
  channelQualtrics: boolean;
  channelIR: boolean;
  customerInternal: boolean;
  customerExternal: boolean;
  issue: string;
  targetDept: string;
  rootCause: string;
  severityAC: boolean;
  severityDF: boolean;
  severityGI: boolean;
  severityLevel: 'A-C' | 'D-F' | 'G-I' | 'Unknown';
  duration1W: boolean;
  duration2W: boolean;
  durationMonth: boolean;
  resolutionTimeframe: '1 Week' | '2 Weeks' | '1 Month' | 'General';
  leadSupervisor: string;
  shortTermFix: string;
  longTermFix: string;
  responsible: string;
  status: 'Complete' | 'In Progress' | 'Pending' | string;
}

export interface System8Row {
  month: string;
  // Dimension 1: Engagement
  engActivity: string;
  engJoined: number;
  engNotJoined: number;
  engGoodPct: number;
  engFairPct: number;
  engPoorPct: number;
  engTotalPct: number;
  engResponsible: string;

  // Dimension 2: Competency
  devDate: string;
  devActivity: string;
  devJoined: number;
  devNotJoined: number;
  devIs10Sys: boolean;
  devIsHappy: boolean;
  devIsAOP: boolean;
  devGoodPct: number;
  devTotalPct: number;
  devResponsible: string;

  // Dimension 3: Safety Culture
  cultureDate: string;
  cultureActivity: string;
  cultureJoined: number;
  cultureNotJoined: number;
  culturePHQ: boolean;
  cultureWeBeforeMe: boolean;
  cultureVPC: boolean;
  cultureSafety: boolean;
  cultureGoodPct: number;
  cultureTotalPct: number;
  cultureResponsible: string;
}

export interface System9Row {
  date: string;
  bestPractice: string;
  priority: string;
  customerGroup: string;
  projectName: string;
  activity: string;
  target: string;
  resultM1: string;
  resultM2: string;
  resultM3: string;
  resultM4: string;
  resultM5: string;
  wiDocNumber: string;
  wiTitle: string;
  responsible: string;
}

export interface SystemComparisonMetric {
  id: 'sys2' | 'sys5' | 'sys8' | 'sys9';
  name: string;
  codeName: string;
  tagline: string;
  totalRecords: number;
  score: number; // 0 - 100
  targetScore: number;
  status: 'Optimal' | 'Caution' | 'Target Met';
  keyMetricLabel: string;
  keyMetricValue: string;
  trend: 'up' | 'stable' | 'down';
  trendPercent: number;
  leadResponsible: string;
  // 5 Radar Dimensions (0-100)
  radar: {
    executionEfficiency: number;
    standardCompliance: number;
    stakeholderEngagement: number;
    continuousImprovement: number;
    safetyAndRiskControl: number;
  };
}

export interface PredictiveInsight {
  predictedAckRateNextMonth: number;
  predictedAckRateTrend: 'up' | 'stable' | 'down';
  regressionSlope: number;
  healthIndexScore: number; // Overall composite score
  criticalRiskCount: number;
  highPriorityBottlenecks: Array<{
    id: string;
    system: string;
    department: string;
    title: string;
    severity: 'High' | 'Medium' | 'Low';
    description: string;
    recommendedAction: string;
  }>;
  executiveRecommendations: Array<{
    id: string;
    title: string;
    category: string;
    impact: 'High' | 'Medium';
    timeframe: string;
    detail: string;
    targetSystem: string;
  }>;
  projectedForecast: Array<{
    period: string;
    actualAckRate?: number;
    projectedAckRate: number;
    projectedComplaints: number;
  }>;
}

export interface DashboardDataset {
  spreadsheetId: string;
  appsScriptUrl: string;
  lastSynced: string;
  monthsAvailable: string[];
  system2: System2Row[];
  system5: System5Row[];
  system8: System8Row[];
  system9: System9Row[];
  comparison: SystemComparisonMetric[];
  predictive: PredictiveInsight;
}
