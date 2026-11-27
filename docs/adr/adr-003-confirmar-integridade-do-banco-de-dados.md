# ADR-003: Confirmar integridade do banco de dados

- **Status:** Aceita
- **Data:** 2026-11-24
- **Autor:** HEITOR DIDIER JALFIM (hdj@cesar.school)
- **Turma:** Regular (terças)
- **Projeto:** Origem · marketplace da economia criativa e do artesanato de Pernambuco

## Contexto

O frontend ja esta pronto e o back esta para ser finalizado. faltam pequenos ajustes do banco de dados para migrar para PostgreSQL e implementação de servico concorrente.

## Preocupações

prazo

## Decisão

implementacao de verificacao constante no banco de dados.

## Justificativa

pois isso evita que duas pessoas comprem o ultimo item de um estoque, ja que o valor estara sempre sendo atualizado

## Consequências

se ganha confiabilidade para a plataforma, melhorando a experiencia de usuarios e vendedores. se perde em complexidade de codigo, e maior margem de erro, tendo maior quantidade de linhas onde podem acontecer erros.

## Alternativas consideradas

usar apenas um repositorio no github, foi feito separação entre back e front.

## Rastreabilidade

**Atributo de qualidade:** Confiabilidade · Ausência de falhas

**Cenário que originou a decisão:**

> Quando dois compradores tentam finalizar a compra do último item disponível de um artesão ao mesmo tempo, o serviço de checkout, a gestão de estoque e o banco de dados de pedidos, em operação normal ou em pico de acessos na loja, validam a disponibilidade de forma consistente para confirmar apenas uma compra e rejeitar a concorrente sem corromper o estado, resultando em nenhuma venda duplicada e nenhuma requisicao deixa o estoque negativo estoque negativo em cenarios concorrentes

**Padrão arquitetural adotado:** Camadas

**Táticas empacotadas:** Encapsular responsabilidades por faixa; Restringir dependências a uma direção; Usar intermediário entre camadas

commits.

## Verificação

- **Teste do cenário:** enviando duas requisicoes http para o mesmo endpoint

---

_Gerado pelo estudo dirigido de Arquitetura de Software · ADS020 · 2026.2._
