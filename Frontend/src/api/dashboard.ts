import axios from "axios";

export interface DashboardData {
  totalDocuments: number;
  totalDocumentsToday: number;
  totalIndexed: number;
  totalIndexedToday: number;
  totalFailed: number;
  totalSearch: number;
  totalSearchToday: number;
  totalSearchYesterday: number;
  avgResponseTimeSec: number | null;
  avgResponseTimeSecYesterday: number | null;
  totalActiveUsers: number;
  totalNewUsers: number;
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await axios.get<DashboardData>("http://localhost:3001/dashboard");
  return response.data;
};