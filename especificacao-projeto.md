# Especificação do Projeto — App de Treino do Bruno

## Contexto para quem for implementar (Claude Code)

Este documento resume tudo que foi definido numa conversa de planejamento antes de começar a construir. O objetivo é que você (Claude Code, rodando no VS Code) leia este arquivo primeiro e já tenha todo o contexto necessário para começar a desenvolver sem precisar re-perguntar o que já foi decidido. Perguntas genuinamente novas (detalhes de implementação, bibliotecas, etc.) podem ser feitas ao usuário normalmente.

O usuário (Bruno) nunca programou um projeto do zero antes neste tipo de ambiente — tem noção básica de Python (Thonny/Spyder), mas nunca usou VS Code, Git ou GitHub de forma prática. Explicações devem ser passo a passo, sem jargão de programação assumido como óbvio. Ele aprende melhor fazendo/produzindo do que estudando teoria primeiro.

---

## 1. Objetivo do projeto

Um aplicativo web simples (PWA — Progressive Web App) para acompanhar os treinos de academia do Bruno: registrar o que foi feito, ver evolução de carga, manter frequência, e ser usado direto do celular como se fosse um app nativo.

---

## 2. Perfil do usuário e contexto de treino

- 22 anos, 1,82m, ~75kg, biotipo magro que vem ganhando massa (pesava 68-70kg antes)
- Treina desde os 15 anos, mas sem muita constância até ~1 ano atrás. Hoje treina com constância moderada: nunca passa 2 semanas sem ir, mas também não mantém 2-3x/semana por 4 semanas seguidas
- **Sem personal trainer, mas tem experiência básica de academia**
- Treina na **Smart Fit**
- Joga futebol (pelada) todo sábado de manhã
- Sono: 6h30-7h por noite
- Alimentação: razoável, sem dieta regrada
- Rotina muito variável: estágio híbrido (Votorantim Cimentos) + faculdade à noite (Engenharia de Produção, UnB) + estudo de inglês — **não tem horário fixo de treino**, varia entre tarde (após trabalho) e noite (~21h, após faculdade)

### Histórico médico — CRÍTICO, afeta diretamente a prescrição de exercícios

- **Cirurgia de reconstrução de LCA no joelho direito**, feita em fevereiro de 2025 (2 anos em fev/2027). O enxerto para o ligamento foi retirado da musculatura posterior da coxa direita, o que enfraqueceu essa região. Hoje ainda há uma diferença de força perceptível entre a posterior direita (mais fraca) e a esquerda.
- Fisioterapia de recuperação já foi concluída — já joga futebol normalmente.
- **Condropatia patelar**: grau 1 no joelho esquerdo, grau 3 no joelho direito. Não há dor significativa no momento, mas uma infiltração está planejada (sem data ainda) para permitir treino de perna mais intenso.
- **Restrição ativa**: evitar amplitude de flexão de joelho além de ~90 graus. Evitar ao máximo exercícios de alto impacto/sobrecarga na articulação patelofemoral (ex.: cadeira extensora foi propositalmente excluída do plano).
- Importante: este app **não deve dar conselho médico** — ele apenas registra e segue o plano já definido com cautela. Qualquer mudança de restrição deve vir de um profissional de saúde consultado pelo Bruno, não do app.

---

## 3. O plano de treino (fixo, já definido e validado pelo Bruno)

Divisão A/B alternada (A-B-A numa semana, B-A-B na seguinte), sem dias fixos — o app sugere o próximo treino com base no último concluído (ver seção 5).

Cada treino: até 6 exercícios, ~50-60 minutos, exercícios mais pesados/compostos primeiro (é quando o Bruno tem mais energia).

### Treino A (~55 min)

| # | Exercício principal | Alternativa | Séries x Reps | Observações de cuidado |
|---|---|---|---|---|
| 1 | Leg press | Agachamento no Smith (controle de profundidade) | 3x10-12 | Amplitude controlada — não passar de ~90° de flexão de joelho |
| 2 | Stiff unilateral com halteres | Stiff bilateral com halteres (carga reduzida) | 3x10 cada perna | Perna direita (posterior mais fraca) com carga mais leve até equilibrar com a esquerda |
| 3 | Mesa flexora (leg curl) unilateral | Flexora em pé unilateral | 3x12 cada perna | Foco em igualar força entre as pernas |
| 4 | Supino (barra ou halteres) | Supino máquina ou crucifixo máquina | 3x8-10 | — |
| 5 | Remada baixa | Remada cavalinho ou remada unilateral (serrote) | 3x10-12 | — |
| 6 | Prancha / anti-rotação de core | Abdominal na polia alta | 3x30-45s | — |

### Treino B (~55 min)

| # | Exercício principal | Alternativa | Séries x Reps | Observações de cuidado |
|---|---|---|---|---|
| 1 | Hip thrust / elevação pélvica | Glúteo na máquina (kickback) ou 4 apoios com caneleira | 3x10-12 | Baixo estresse no joelho — bom para posterior/glúteo |
| 2 | Afundo curto ou step-up (amplitude reduzida) | Passada (lunge) estacionária, mesma amplitude reduzida | 3x10 cada perna | **Não substituir por leg press unilateral** — somaria volume excessivo de joelho junto com o Treino A |
| 3 | Desenvolvimento de ombro | Elevação lateral + elevação frontal (bi-set) | 3x8-10 | — |
| 4 | Puxada frente | Remada unilateral na polia | 3x10-12 | — |
| 5 | Rosca + tríceps (bi-set) | Rosca alternada com halteres + tríceps na polia | 3x12 | — |
| 6 | Panturrilha em pé + equilíbrio unipodal (bi-set) | Panturrilha sentada + prancha unipodal | 3x15 / 3x20-30s cada lado | Equilíbrio ajuda na propriocepção pós-LCA e prevenção de lesão no futebol |

**Nota**: o usuário disse que vai confirmar os nomes exatos das máquinas disponíveis na unidade Smart Fit dele e pode querer ajustar nomes/opções depois — mas a estrutura acima (6 exercícios por treino, ordem, lógica dos substitutos) está validada e não deve mudar sem o usuário pedir.

### Princípios de priorização usados na montagem (contexto, não para repetir ao usuário)
- Exercícios multiarticulares/compostos têm prioridade sobre isolamento puro, dado o volume limitado (6 exercícios)
- Todo treino (A ou B) garante peito ou costas + ombro/braço, não depende de qual sessão caiu na semana
- Trabalho unilateral de posterior foi priorizado para não deixar a perna esquerda compensar/mascarar a assimetria da direita

---

## 4. Requisitos funcionais do app

### 4.1 Estética e usabilidade geral
- Visual clean, moderno, com toque de "tecnologia atual" — mas sem exagero
- Extremamente intuitivo, uso rápido dentro da academia (telas simples, toques grandes, pouca digitação)
- Uso é 100% mobile (celular), mas o app deve ser "instalável" como PWA (ver seção 6)

### 4.2 Calendário e histórico
- Calendário visual mostrando em quais dias o usuário treinou e qual treino fez (A ou B)
- Precisa de um botão/ação clara de "concluir treino" ao final da sessão, que é o que alimenta o calendário e o histórico

### 4.3 Fluxo de treino
- Ao abrir o app, ele **sugere automaticamente** o treino do dia com base no último treino concluído (se o último foi A, sugere B; e vice-versa — sem calendário fixo de dias da semana)
- O usuário pode aceitar a sugestão ou escolher manualmente qual treino fazer
- Dentro do treino escolhido, duas formas de uso, selecionáveis pelo usuário:
  - **Modo lista livre**: vê todos os exercícios do treino como lista, pode clicar em qualquer um, em qualquer ordem
  - **Modo sequencial guiado**: começa do primeiro exercício, ao marcar como concluído avança automaticamente para o próximo

### 4.4 Dentro de cada exercício
- Cronômetro de descanso: o app já sugere/indica um tempo de descanso padrão, mas o usuário pode ajustar o tempo do alarme
- Campos de registro: repetições, peso, número de série (editável manualmente)
- Gráfico/visualização de evolução de carga ao longo do tempo para aquele exercício
- Imagem ilustrativa demonstrando o exercício — **ilustrações simples originais** (ex.: estilo diagrama/stick figure), não fotos ou vídeos de terceiros (questão de direitos autorais)
- Texto de observação/cuidados específicos do exercício (postura, amplitude, pontos de atenção) — usar as observações já definidas na tabela da seção 3
- Opção de trocar para o exercício alternativo/substituto **sob demanda** (não é automático — o padrão é sempre o exercício principal fixo; o usuário escolhe manualmente quando quiser usar a alternativa)

### 4.5 Progressão de carga
- O app deve sugerir progressão de carga/reps com base no histórico (frequência, cargas anteriores) — uma lógica simples é suficiente para começar (ex.: se completou todas as séries na reps máxima nas últimas X vezes, sugere aumento de carga)
- O usuário sempre pode aceitar a sugestão ou editar manualmente — edição manual tem que estar sempre disponível, a automação é um apoio, não uma obrigação

### 4.6 Edição manual vs. automação
- Regra geral do app: tudo que é automatizado (sugestão de treino, sugestão de progressão, tempo de descanso) deve ter uma opção de ajuste manual visível e fácil de usar

---

## 5. Decisões técnicas já fechadas

1. **Arquitetura**: PWA estático (HTML/CSS/JS), sem backend/servidor próprio
2. **Hospedagem**: GitHub Pages (gratuito), repositório já existe na conta GitHub do usuário (conectada ao VS Code), mas ele não tem certeza se já criou um repositório para este projeto especificamente — isso precisa ser verificado/criado como um dos primeiros passos
3. **Armazenamento de dados**: localStorage do navegador (sem banco de dados externo). Implicação importante que o usuário já está ciente: os dados ficam presos ao navegador/dispositivo — se limpar dados do navegador, trocar de celular, etc., perde o histórico. **Por isso, é obrigatório incluir uma função de exportar/importar backup (arquivo JSON)** para o usuário salvar manualmente (ex.: no Google Drive) e restaurar se precisar
4. **Instalação no celular**: via "Adicionar à tela inicial" do navegador (Chrome/Safari), funcionando como PWA instalável, com funcionamento offline
5. **Imagens dos exercícios**: ilustrações originais simples (não fotos/vídeos de terceiros — questão de copyright)
6. **Lógica de sugestão de treino**: baseada no último treino concluído, não em dia da semana fixo

---

## 6. Primeiros passos sugeridos para quem for implementar

1. Confirmar com o usuário se já existe um repositório GitHub para este projeto ou se precisa criar um novo
2. Estruturar o projeto (ex.: `index.html`, `style.css`, `app.js`, pasta de imagens/ilustrações, `manifest.json` e service worker para funcionalidade PWA)
3. Implementar o fluxo central primeiro (tela inicial com sugestão de treino → tela do treino → registro de exercício → concluir treino → calendário), antes de refinar estética
4. Deixar a parte de ilustrações e gráficos de evolução para depois do fluxo funcional estar pronto, já que são mais trabalhosas
5. Configurar GitHub Pages só depois que houver uma versão minimamente funcional para testar no celular

### Dinâmica de trabalho esperada pelo usuário

O usuário quer construir em ciclos curtos, não receber o projeto pronto de uma vez:

1. Implementar uma parte pequena e funcional (ex.: só a tela inicial com sugestão de treino)
2. Rodar localmente para o usuário testar no navegador (e, quando possível, no celular)
3. Usuário dá feedback / valida
4. Só então avançar para a próxima parte

Evitar implementar o app inteiro de uma vez sem checkpoints — o usuário nunca programou um projeto do zero e precisa acompanhar e entender o que está sendo construído em cada etapa, não só receber um resultado final.

---

## 7. O que NÃO fazer

- Não incluir orientação médica própria do app além do que já foi definido nas observações de cuidado de cada exercício
- Não trocar a estrutura do plano de treino (ordem, exercícios, divisão A/B) sem o usuário pedir explicitamente
- Não usar fotos ou vídeos de terceiros nas ilustrações dos exercícios
- Não depender de backend/servidor — manter a arquitetura estática simples
