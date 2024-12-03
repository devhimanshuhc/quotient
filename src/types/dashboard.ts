export interface DashboardActivity {
  id: string;
  title: string;
  updatedAt: string;
  collection: string | null;
}

interface Collection {
  id: string;
  name: string;
}

export interface DashboardData {
  collections: {
    total: number;
    items: Collection[];
  };
  writings: {
    total: number;
  };
  recentActivity: DashboardActivity[];
}
