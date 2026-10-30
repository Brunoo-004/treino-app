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
//   config:    { descanso: 90 }                    // preferências (descanso em segundos)
function dadosVazios() {
  return { historico: [], rascunho: {}, concluidos: {}, config: { descanso: 90 } };
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
    if (series.length > 0 || concluido) exercicios.push({ nome: ex.nome, series, concluido });
  });

  const sessao = { data: dataLocal(), treino: letra, exercicios };
  dados.historico.push(sessao);

  Object.keys(dados.rascunho).forEach((chave) => {
    if (chave.startsWith(`${letra}-`)) delete dados.rascunho[chave];
  });
  Object.keys(dados.concluidos).forEach((chave) => {
    if (chave.startsWith(`${letra}-`)) delete dados.concluidos[chave];
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
