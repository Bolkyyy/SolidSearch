import axios from "axios";

export interface DashboardData {
  totalDocuments: number;
  totalDocumentsToday: number;
  totalIndexed: number;
  totalIndexedToday: number;
  totalSearch: number;
  totalSearchToday: number;
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await axios.get<DashboardData>("/api/dashboard");
  return response.data;
};
