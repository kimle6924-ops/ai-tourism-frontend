import axiosInstance from '../utils/headerApi';
import type { ApiResponse } from './LoginService';

export interface AdministrativeUnit {
    id: string;
    name: string;
    level: number; // 0 = Province, 1 = Ward
    parentId: string | null;
    code: string;
}

export interface PaginatedAdminUnits {
    items: AdministrativeUnit[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

const AdministrativeUnitService = {
    getByLevel: async (level: number): Promise<ApiResponse<AdministrativeUnit[]>> => {
        const res = await axiosInstance.get<ApiResponse<AdministrativeUnit[]>>(
            `/api/administrative-units/by-level/${level}`,
        );
        return res.data;
    },

    getChildren: async (parentId: string): Promise<ApiResponse<AdministrativeUnit[]>> => {
        const res = await axiosInstance.get<ApiResponse<AdministrativeUnit[]>>(
            `/api/administrative-units/${parentId}/children`,
        );
        return res.data;
    },

    getById: async (id: string): Promise<ApiResponse<AdministrativeUnit>> => {
        const res = await axiosInstance.get<ApiResponse<AdministrativeUnit>>(
            `/api/administrative-units/${id}`,
        );
        return res.data;
    },
};

export default AdministrativeUnitService;
