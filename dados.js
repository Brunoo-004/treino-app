// Os dois treinos, conforme a especificação (seção 3).
const TREINOS = {
  A: {
    nome: "Treino A",
    duracao: "~55 min",
    exercicios: [
      {
        nome: "Leg press",
        alternativa: "Agachamento no Smith (controle de profundidade)",
        series: "3x10-12",
        obs: "Amplitude controlada — não passar de ~90° de flexão de joelho",
      },
      {
        nome: "Stiff unilateral com halteres",
        alternativa: "Stiff bilateral com halteres (carga reduzida)",
        series: "3x10 cada perna",
        obs: "Perna direita (posterior mais fraca) com carga mais leve até equilibrar com a esquerda",
      },
      {
        nome: "Mesa flexora (leg curl) unilateral",
        alternativa: "Flexora em pé unilateral",
        series: "3x12 cada perna",
        obs: "Foco em igualar força entre as pernas",
      },
      {
        nome: "Supino (barra ou halteres)",
        alternativa: "Supino máquina ou crucifixo máquina",
        series: "3x8-10",
        obs: "",
      },
      {
        nome: "Remada baixa",
        alternativa: "Remada cavalinho ou remada unilateral (serrote)",
        series: "3x10-12",
        obs: "",
      },
      {
        nome: "Prancha / anti-rotação de core",
        alternativa: "Abdominal na polia alta",
        series: "3x30-45s",
        obs: "",
      },
    ],
  },
  B: {
    nome: "Treino B",
    duracao: "~55 min",
    exercicios: [
      {
        nome: "Hip thrust / elevação pélvica",
        alternativa: "Glúteo na máquina (kickback) ou 4 apoios com caneleira",
        series: "3x10-12",
        obs: "Baixo estresse no joelho — bom para posterior/glúteo",
      },
      {
        nome: "Afundo curto ou step-up (amplitude reduzida)",
        alternativa: "Passada (lunge) estacionária, mesma amplitude reduzida",
        series: "3x10 cada perna",
        obs: "Não substituir por leg press unilateral — somaria volume excessivo de joelho junto com o Treino A",
      },
      {
        nome: "Desenvolvimento de ombro",
        alternativa: "Elevação lateral + elevação frontal (bi-set)",
        series: "3x8-10",
        obs: "",
      },
      {
        nome: "Puxada frente",
        alternativa: "Remada unilateral na polia",
        series: "3x10-12",
        obs: "",
      },
      {
        nome: "Rosca + tríceps (bi-set)",
        alternativa: "Rosca alternada com halteres + tríceps na polia",
        series: "3x12",
        obs: "",
      },
      {
        nome: "Panturrilha em pé + equilíbrio unipodal (bi-set)",
        alternativa: "Panturrilha sentada + prancha unipodal",
        series: "3x15 / 3x20-30s cada lado",
        obs: "Equilíbrio ajuda na propriocepção pós-LCA e prevenção de lesão no futebol",
      },
    ],
  },
};

// ---------- Armazenamento no navegador (localStorage) ----------

const CHAVE_STORAGE = "treino-app-v1";

// Formato guardado:
// {
//   historico: [{ data: "2026-10-29", treino: "A", exercicios: [{ nome, series: [{ reps, peso }] }] }],
//   rascunho:  { "A-0": [{ reps, peso }, ...] }   // treino em andamento, ainda não concluído
// }
//   concluidos: { "A-0": true }                    // exercícios já marcados como concluídos no treino em andamento
//   alternativas: { "A-0": true }                  // exercícios trocados pela alternativa no treino em andamento
//   config:    { descanso: 90 }                    // preferências (descanso em segundos)
function dadosVazios() {
  return { historico: [], rascunho: {}, concluidos: {}, alternativas: {}, config: { descanso: 90 } };
}

function carregarDados() {
  try {
    const bruto = localStorage.getItem(CHAVE_STORAGE);
    if (!bruto) return dadosVazios();
    const lido = JSON.parse(bruto);
    const config = lido.config && typeof lido.config === "object" ? lido.config : {};
    return {
      historico: Array.isArray(lido.historico) ? lido.historico : [],
      rascunho: lido.rascunho && typeof lido.rascunho === "object" ? lido.rascunho : {},
      concluidos: lido.concluidos && typeof lido.concluidos === "object" ? lido.concluidos : {},
      alternativas: lido.alternativas && typeof lido.alternativas === "object" ? lido.alternativas : {},
      config: {
        descanso: Number(config.descanso) > 0 ? Number(config.descanso) : 90,
      },
    };
  } catch (erro) {
    return dadosVazios();
  }
}

const dados = carregarDados();

function salvarDados() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
  } catch (erro) {
    alert("Não consegui salvar no navegador. Verifique se o armazenamento está liberado.");
  }
}

// ---------- Datas ----------

// Data de hoje no fuso do aparelho, "AAAA-MM-DD" (toISOString usaria UTC e erraria o dia à noite).
function dataLocal(data = new Date()) {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

// "2026-10-29" → "29/10"
function formatarData(texto) {
  const [, mes, dia] = texto.split("-");
  return `${dia}/${mes}`;
}

// ---------- Histórico ----------

// Último treino concluído: o de data mais recente (em empate, o registrado por último).
function ultimoTreinoConcluido() {
  let ultimo = null;
  dados.historico.forEach((sessao) => {
    if (!ultimo || sessao.data >= ultimo.data) ultimo = sessao;
  });
  return ultimo;
}

// Sugere o próximo treino com base no último concluído.
// Sem histórico, começa pelo A. Se o último foi A, sugere B, e vice-versa.
function sugerirTreino(ultimoTreino) {
  if (ultimoTreino === "A") return "B";
  if (ultimoTreino === "B") return "A";
  return "A";
}

function serieTemDados(serie) {
  return serie.reps !== "" || serie.peso !== "";
}

// Quantas séries do exercício já têm reps ou peso digitado no rascunho.
function seriesPreenchidas(letra, indice) {
  const series = dados.rascunho[`${letra}-${indice}`] || [];
  return series.filter(serieTemDados).length;
}

function exercicioConcluido(letra, indice) {
  return dados.concluidos[`${letra}-${indice}`] === true;
}

function definirExercicioConcluido(letra, indice, valor) {
  const chave = `${letra}-${indice}`;
  if (valor) dados.concluidos[chave] = true;
  else delete dados.concluidos[chave];
  salvarDados();
}

// Quantos exercícios do treino já foram marcados como concluídos.
function exerciciosConcluidos(letra) {
  return TREINOS[letra].exercicios.filter((_, indice) => exercicioConcluido(letra, indice)).length;
}

// Registro mais recente de um exercício no histórico: { data, series } ou null.
function ultimaVezDoExercicio(nome) {
  let achada = null;
  dados.historico.forEach((sessao) => {
    const ex = sessao.exercicios.find(
      (e) => e && e.nome === nome && Array.isArray(e.series) && e.series.length > 0
    );
    if (ex && (!achada || sessao.data >= achada.data)) {
      achada = { data: sessao.data, series: ex.series };
    }
  });
  return achada;
}

// Quantos treinos foram concluídos nos últimos N dias (contando hoje).
function treinosNosUltimosDias(dias) {
  const limite = new Date();
  limite.setDate(limite.getDate() - (dias - 1));
  const minimo = dataLocal(limite);
  return dados.historico.filter((sessao) => sessao.data >= minimo).length;
}

function excluirSessao(sessao) {
  const posicao = dados.historico.indexOf(sessao);
  if (posicao >= 0) {
    dados.historico.splice(posicao, 1);
    salvarDados();
  }
}

// ---------- Exercício alternativo ----------

function usandoAlternativa(letra, indice) {
  return dados.alternativas[`${letra}-${indice}`] === true;
}

function definirAlternativa(letra, indice, valor) {
  const chave = `${letra}-${indice}`;
  if (valor) dados.alternativas[chave] = true;
  else delete dados.alternativas[chave];
  salvarDados();
}

// Nome do exercício que está sendo feito: o principal ou a alternativa escolhida.
function nomeEmUso(letra, indice) {
  const ex = TREINOS[letra].exercicios[indice];
  return usandoAlternativa(letra, indice) ? ex.alternativa : ex.nome;
}

// ---------- Progressão de carga e evolução ----------

// "3x10-12" → 3 séries. Se não achar número, usa 3.
function contarSeries(texto) {
  const n = parseInt(texto, 10);
  return Number.isNaN(n) ? 3 : n;
}

// Repetições no topo da faixa: "3x10-12" → 12, "3x10 cada perna" → 10.
// Exercícios por tempo ("3x30-45s") ou bi-set com tempos diferentes ("... / ...") → null.
function topoDaFaixa(texto) {
  if (texto.includes("/")) return null;
  const partes = texto.match(/^\d+x(\d+)(?:-(\d+))?(s?)/);
  if (!partes || partes[3] === "s") return null;
  return Number(partes[2] || partes[1]);
}

// Regra simples: se na última vez todas as séries do plano foram feitas no topo da faixa
// com o mesmo peso, sugere +2,5 kg. Senão, sugere manter o maior peso e buscar o topo.
// Devolve { tipo: "subir" | "manter", peso, topo } ou null quando não há base para sugerir.
function sugerirProgressao(planoSeries, nome) {
  const topo = topoDaFaixa(planoSeries);
  const ultima = ultimaVezDoExercicio(nome);
  if (topo === null || !ultima) return null;

  const validas = ultima.series.filter(
    (s) => typeof s.reps === "number" && typeof s.peso === "number" && s.peso > 0
  );
  if (validas.length === 0) return null;

  const pesoMaximo = Math.max(...validas.map((s) => s.peso));
  const todasNoTopo =
    validas.length >= contarSeries(planoSeries) &&
    validas.every((s) => s.peso === pesoMaximo && s.reps >= topo);

  return todasNoTopo
    ? { tipo: "subir", peso: pesoMaximo + 2.5, topo }
    : { tipo: "manter", peso: pesoMaximo, topo };
}

// Maior peso de cada treino em que o exercício aparece, do mais antigo ao mais recente.
function evolucaoDoExercicio(nome) {
  const pontos = [];
  dados.historico.forEach((sessao, ordem) => {
    const ex = sessao.exercicios.find((e) => e && e.nome === nome && Array.isArray(e.series));
    if (!ex) return;
    const pesos = ex.series.map((s) => s.peso).filter((p) => typeof p === "number" && p > 0);
    if (pesos.length > 0) pontos.push({ data: sessao.data, peso: Math.max(...pesos), ordem });
  });
  return pontos.sort((a, b) => (a.data === b.data ? a.ordem - b.ordem : a.data < b.data ? -1 : 1));
}

// Transforma o rascunho do treino em uma sessão do histórico e limpa o rascunho.
function concluirTreino(letra) {
  const exercicios = [];
  TREINOS[letra].exercicios.forEach((ex, indice) => {
    const series = (dados.rascunho[`${letra}-${indice}`] || [])
      .filter(serieTemDados)
      .map((s) => ({
        reps: s.reps === "" ? null : Number(s.reps),
        peso: s.peso === "" ? null : Number(s.peso),
      }));
    const concluido = exercicioConcluido(letra, indice);
    if (series.length > 0 || concluido) {
      exercicios.push({
        nome: nomeEmUso(letra, indice),
        alternativa: usandoAlternativa(letra, indice),
        series,
        concluido,
      });
    }
  });

  const sessao = { data: dataLocal(), treino: letra, exercicios };
  dados.historico.push(sessao);

  [dados.rascunho, dados.concluidos, dados.alternativas].forEach((mapa) => {
    Object.keys(mapa).forEach((chave) => {
      if (chave.startsWith(`${letra}-`)) delete mapa[chave];
    });
  });

  salvarDados();
  return sessao;
}

// ---------- Backup (exportar / importar) ----------

// Baixa o histórico como arquivo JSON.
function exportarBackup() {
  const conteudo = JSON.stringify({ historico: dados.historico }, null, 2);
  const arquivo = new Blob([conteudo], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = `treino-backup-${dataLocal()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Lê o texto de um backup, valida e devolve a lista de sessões. Lança erro se for inválido.
function lerBackup(texto) {
  let lido;
  try {
    lido = JSON.parse(texto);
  } catch (erro) {
    throw new Error("O arquivo não é um JSON válido.");
  }
  if (!lido || !Array.isArray(lido.historico)) {
    throw new Error("O arquivo não parece ser um backup deste app.");
  }
  const sessoes = lido.historico.filter(
    (s) =>
      s &&
      typeof s.data === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(s.data) &&
      (s.treino === "A" || s.treino === "B") &&
      Array.isArray(s.exercicios)
  );
  if (sessoes.length !== lido.historico.length) {
    throw new Error("O backup tem registros inválidos. Nada foi importado.");
  }
  return sessoes;
}

// Substitui o histórico atual pelo do backup.
function substituirHistorico(sessoes) {
  dados.historico = sessoes;
  salvarDados();
}
