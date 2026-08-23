import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'imaginemyapps.project-plans.v2';
const OLD_STORAGE_KEY = 'imaginemyapps.project-plans.v1';

export type ProjectTask = { id: string; title: string; done: boolean };
export type ProjectMilestone = { id: string; title: string; targetDate: string; done: boolean };
export type BudgetItem = { id: string; title: string; amount: number };

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
  status: 'Idea' | 'Planning' | 'In progress' | 'Ready to launch';
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  budgetItems: BudgetItem[];
  createdAt: string;
  updatedAt: string;
};

export async function loadPlans(): Promise<ProjectPlan[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY) || await AsyncStorage.getItem(OLD_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<ProjectPlan>[];
    const normalized = parsed.map((plan) => ({
      ...plan,
      id: plan.id || `${Date.now()}`,
      name: plan.name || 'Untitled project', audience: plan.audience || 'Not defined', type: plan.type || 'Mobile app', platforms: plan.platforms || [], features: plan.features || [], notes: plan.notes || '',
      estimateLow: plan.estimateLow || 0, estimateHigh: plan.estimateHigh || 0, weeksLow: plan.weeksLow || 0, weeksHigh: plan.weeksHigh || 0,
      checklist: plan.checklist?.length === checklistLabels.length ? plan.checklist : checklistLabels.map((_, index) => Boolean(plan.checklist?.[index])),
      status: plan.status || 'Planning', tasks: plan.tasks || [], milestones: plan.milestones || [], budgetItems: plan.budgetItems || [],
      createdAt: plan.createdAt || new Date().toISOString(), updatedAt: plan.updatedAt || new Date().toISOString(),
    })) as ProjectPlan[];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch { return []; }
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

export async function removeAllPlans() { await AsyncStorage.removeItem(STORAGE_KEY); await AsyncStorage.removeItem(OLD_STORAGE_KEY); }

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
