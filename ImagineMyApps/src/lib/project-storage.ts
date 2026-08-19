import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'imaginemyapps.project-plans.v1';

export type ProjectPlan = {
  id: string;
  name: string;
  audience: string;
  type: string;
  platforms: string[];
  features: string[];
  notes: string;
  estimateLow: number;
  estimateHigh: number;
  weeksLow: number;
  weeksHigh: number;
  checklist: boolean[];
  createdAt: string;
  updatedAt: string;
};

export async function loadPlans(): Promise<ProjectPlan[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as ProjectPlan[]; } catch { return []; }
}

export async function savePlan(plan: ProjectPlan) {
  const plans = await loadPlans();
  const next = [plan, ...plans.filter((item) => item.id !== plan.id)];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function removePlan(id: string) {
  const plans = await loadPlans();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plans.filter((item) => item.id !== id)));
}

export const checklistLabels = [
  'The target user is clearly defined',
  'The core problem is validated',
  'Must-have features are prioritized',
  'Content and branding are available',
  'Launch and support needs are identified',
];

export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
