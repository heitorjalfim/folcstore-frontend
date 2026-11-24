# ADR-001: Isolar as integrações externas do backend com Portas e Adaptadores e fallback por popularidade

- **Status:** Proposta
- **Data:** 2026-11-23
- **Autor:** MANOEL HENRIQUE NASCIMENTO E SILVA (mhns@cesar.school)
- **Turma:** Regular (terças)
- **Projeto:** Origem · marketplace da economia criativa e do artesanato de Pernambuco

## Contexto

O Origem é um marketplace de artesanato desenvolvido por uma equipe pequena de estudantes, com prazo de um semestre e sem orçamento de infraestrutura. A stack foi acordada com Desenvolvimento Web (Next.js no frontend e Express + Prisma no backend) e o modelo de dados com Banco de Dados. O backend já segue arquitetura em camadas, mas depende de componentes que podem ficar indisponíveis: o serviço de recomendações, o cache Redis do catálogo e a hospedagem gratuita, que suspende serviços ociosos. Hoje o backend chama o serviço de recomendações diretamente, espera até 15 segundos por ele e, quando ele falha, responde com erro 503. Assim, uma falha secundária chega até o comprador. A prioridade definida é a tolerância a falhas: catálogo, carrinho e checkout devem continuar funcionando mesmo quando um componente secundário falha.

## Preocupações

tolerância a falhas, disponibilidade da venda, tempo de resposta, testabilidade, custo de mudança, prazo, custo de infraestrutura

## Decisão

Adotar o padrão Portas e Adaptadores nas integrações externas do backend: o domínio passa a depender de uma porta ProvedorDeRecomendacoes, implementada por um adaptador HTTP para o serviço de recomendações (com timeout de 1 segundo) e por um adaptador de fallback que retorna os produtos mais vendidos a partir do próprio banco. O cache do catálogo segue a mesma regra: se o Redis falhar, a leitura vai direto ao banco.

## Justificativa

A decisão atende diretamente ao cenário da etapa 2. Ao encapsular o serviço de recomendações em um adaptador com timeout curto, a sua falha fica contida na borda do sistema e não chega à página do produto, o que mantém o carregamento em até 3 segundos no p95 e evita telas de erro. Como a página do produto e o checkout dependem apenas da porta, e não do serviço concreto, a troca para o adaptador de produtos populares acontece de forma transparente, e 100% dos checkouts continuam sendo concluídos. O padrão não exige infraestrutura nova nem mudança de stack, respeitando o prazo, a equipe pequena e a hospedagem gratuita, e aproveita a estrutura que o backend já tem em src/integrations/.

## Consequências

Positivas: a falha do serviço de recomendações ou do cache deixa de interromper a venda: catálogo, carrinho e checkout continuam funcionando em modo degradado. O tempo máximo de espera por uma dependência externa cai de 15 segundos para 1 segundo. O domínio fica desacoplado dos serviços concretos, então é possível trocar o recomendador (por exemplo, por um modelo treinado no futuro) sem alterar a página do produto nem o checkout. As portas facilitam simular falhas em testes automatizados.

Negativas: aumentam a quantidade de código e a indireção, com interfaces, dois adaptadores por integração e a configuração da injeção de dependência, o que eleva o custo de manutenção para uma equipe pequena. Durante a falha, o comprador recebe recomendações menos personalizadas (produtos mais vendidos), o que pode reduzir a conversão por recomendação. O timeout de 1 segundo pode descartar respostas válidas do recomendador em momentos de lentidão, acionando o fallback mais vezes que o necessário. A falha passa a ser silenciosa para o comprador, então, sem registro em log e monitoramento, a equipe pode demorar a perceber que o recomendador está fora do ar. E a decisão não protege contra a queda do próprio backend ou do banco de dados, que continuam sendo pontos únicos de falha.

## Alternativas consideradas

Orientado a Eventos (fila com Redis/BullMQ): também isola falhas, mas exige um broker sempre ativo, que a hospedagem gratuita não sustenta, e traz consistência eventual e complexidade de depuração incompatíveis com a equipe e o prazo. Além disso, o cenário é síncrono, e uma fila não ajuda a responder a página do produto em até 3 segundos.

CQRS: separa os caminhos de leitura e escrita para otimizar desempenho, mas não trata a falha de um componente externo e duplicaria modelos sem necessidade.

Manter apenas Camadas, com try/catch no service: seria a solução mais rápida, mas espalharia o tratamento de falha e a regra de fallback dentro das regras de negócio, misturando responsabilidades e dificultando testar e trocar o recomendador. Também não impede que outras partes do código chamem o serviço externo diretamente.

Remover o serviço de recomendações e calcular tudo no frontend: eliminaria a dependência externa, mas devolveria ao navegador um processamento que já foi separado por desempenho e exporia todo o histórico de pedidos ao cliente.

## Rastreabilidade

**Atributo de qualidade:** Confiabilidade · Tolerância a falhas

**Cenário que originou a decisão:**

> Em operação normal de produção, o serviço de recomendações para de responder enquanto um comprador abre a página de uma peça única e segue para o checkout. O sistema entra em modo degradado: exibe o produto normalmente, substitui as recomendações por produtos populares e conclui a compra sem erro. A página do produto carrega em até 3 segundos no percentil 95, 100% dos checkouts iniciados são concluídos e nenhuma tela de erro é exibida ao comprador.

**Padrão arquitetural adotado:** Portas e Adaptadores

**Táticas empacotadas:** Encapsular a dependência externa; Usar intermediário (a porta); Inverter e injetar dependência



## Verificação

- **Teste do cenário:** Teste automatizado de integração tests/tolerancia-falhas.test.ts (Node test runner + supertest, no mesmo padrão dos testes que já existem no backend), executado com o serviço de recomendações desligado ou substituído por um adaptador que não responde. O teste: (1) requisita a página do produto (GET /api/produtos/:id e GET /api/recomendacoes?produtoId=...) 100 vezes e verifica que todas retornam HTTP 200, que as recomendações vieram do fallback (produtos mais vendidos, campo origem: "POPULARES") e que o p95 do tempo de resposta fica abaixo de 3 segundos; (2) executa o fluxo completo de compra (login, carrinho, POST /api/pedidos) e verifica que 100% dos checkouts são concluídos com status CONFIRMADO e nenhuma resposta 5xx. O teste roda no npm test e no pipeline de CI, então qualquer alteração que volte a propagar a falha do recomendador quebra o build. Complementarmente, o script de carga benchmarks/carga_http.py já existente é reexecutado com o recomendador desligado para medir o p95 sob concorrência.

---

_Gerado pelo estudo dirigido de Arquitetura de Software · ADS020 · 2026.2._
