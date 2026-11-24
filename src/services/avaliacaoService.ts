import { apiService } from './apiService';
import { Avaliacao } from '@/types/avaliacao';
import { Artesao } from '@/types/artesao';

export function calcularNovaMedia(
    notaAtual: number,
    totalAtual: number,
    novaNota: number
): Pick<Artesao, 'notaMedia' | 'totalAvaliacoes'> {
    const novoTotal = totalAtual + 1;
    const novaMedia = ((notaAtual * totalAtual) + novaNota) / novoTotal;
    return { notaMedia: novaMedia, totalAvaliacoes: novoTotal };
}

async function atualizarNotaArtesao(idArtesao: Avaliacao['idArtesao'], novaNota: number): Promise<void> {
    const artRes = await apiService.get<Artesao>(`/artesaos/${idArtesao}`);
    const artesao = artRes.data;

    const notaAtualizada = calcularNovaMedia(
        artesao.notaMedia || 0,
        artesao.totalAvaliacoes || 0,
        novaNota
    );

    await apiService.patch(`/artesaos/${idArtesao}`, notaAtualizada);
}

export const avaliacaoService = {
    async criar(avaliacao: Omit<Avaliacao, 'id'>): Promise<Avaliacao> {
        try {
            const response = await apiService.post<Avaliacao>('/avaliacoes', { 
                ...avaliacao, 
                id: crypto.randomUUID() 
            });

            await atualizarNotaArtesao(avaliacao.idArtesao, avaliacao.nota);

            return response.data;
        } catch (error) {
            console.error("Erro ao registrar avaliação:", error);
            throw error;
        }
    },

    async getPorProduto(idProduto: string | number): Promise<Avaliacao[]> {
        try {
            const response = await apiService.get<Avaliacao[]>('/avaliacoes', {
                params: { 
                    idProduto, 
                    _sort: 'data', 
                    _order: 'desc' 
                }
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar avaliações do produto:", error);
            return [];
        }
    }
};
