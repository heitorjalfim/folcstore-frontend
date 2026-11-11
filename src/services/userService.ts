import { apiService } from './apiService';
import { Customer, Artesao, Admin } from '@/types';

async function verificarCampoUnico<T>(
    endpoint: string,
    campo: 'email' | 'cpf',
    valor: string,
    erro: string
): Promise<void> {
    const existente = await apiService.get<T[]>(endpoint, { params: { [campo]: valor } });
    if (existente.data.length > 0) {
        throw new Error(erro);
    }
}

export const userService = {
    async loginCustomer(email: string, senha: string): Promise<Customer | null> {
        const response = await apiService.get<Customer[]>('/customers', {
            params: { email, senha },
        });
        return response.data.length > 0 ? response.data[0] : null;
    },

    async loginArtesao(email: string, senha: string): Promise<Artesao | null> {
        const response = await apiService.get<Artesao[]>('/artesaos', {
            params: { email, senha },
        });
        return response.data.length > 0 ? response.data[0] : null;
    },

    async loginAdmin(email: string, senha: string): Promise<Admin | null> {
        const response = await apiService.get<Admin[]>('/admins', {
            params: { email, senha },
        });
        return response.data.length > 0 ? response.data[0] : null;
    },

    async registerCustomer(customerData: Omit<Customer, 'id'>): Promise<Customer> {
        await verificarCampoUnico<Customer>('/customers', 'email', customerData.email, 'EMAIL_EXISTS');
        await verificarCampoUnico<Customer>('/customers', 'cpf', customerData.cpf, 'CPF_EXISTS');

        const response = await apiService.post<Customer>('/customers', customerData);
        return response.data;
    },

    async registerArtesao(artesaoData: Omit<Artesao, 'id'>): Promise<Artesao> {
        await verificarCampoUnico<Artesao>('/artesaos', 'email', artesaoData.email, 'EMAIL_EXISTS');
        await verificarCampoUnico<Artesao>('/artesaos', 'cpf', artesaoData.cpf, 'CPF_EXISTS');

        const response = await apiService.post<Artesao>('/artesaos', artesaoData);
        return response.data;
    },

    async getArtesaoById(id: string): Promise<Artesao> {
        try {
            const response = await apiService.get<Artesao>(`/artesaos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar artesão ${id}:`, error);
            throw error;
        }
    },

    async getAllArtesaos(): Promise<Artesao[]> {
        try {
            const response = await apiService.get<Artesao[]>('/artesaos');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar artesãos:', error);
            throw error;
        }
    },
};