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

// Sugere o próximo treino com base no último concluído.
// Se não há histórico, começa pelo A. Se o último foi A, sugere B, e vice-versa.
function sugerirTreino(ultimoTreino) {
  if (ultimoTreino === "A") return "B";
  if (ultimoTreino === "B") return "A";
  return "A";
}

// Ainda não existe histórico (virá no botão "concluir treino"), então fica vazio.
const ultimoTreinoConcluido = null;

const elSugerido = document.getElementById("treino-sugerido");
const elMotivo = document.getElementById("motivo-sugestao");
const elTitulo = document.getElementById("titulo-treino");
const elDuracao = document.getElementById("duracao-treino");
const elLista = document.getElementById("lista-exercicios");
const botoes = {
  A: document.getElementById("botao-A"),
  B: document.getElementById("botao-B"),
};

// Qual treino está selecionado na tela inicial (A ou B).
let treinoAtual = null;

// Mostra na tela o treino escolhido e destaca o botão correspondente.
function mostrarTreino(letra) {
  const treino = TREINOS[letra];
  treinoAtual = letra;

  elTitulo.textContent = treino.nome;
  elDuracao.textContent = treino.duracao;
  elLista.innerHTML = "";

  treino.exercicios.forEach((ex) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="exercicio-nome">${ex.nome}</div>
      <div class="exercicio-series">${ex.series}</div>
      <div class="exercicio-alternativa">Alternativa: ${ex.alternativa}</div>
      ${ex.obs ? `<div class="exercicio-obs">⚠ ${ex.obs}</div>` : ""}
    `;
    elLista.appendChild(li);
  });

  Object.keys(botoes).forEach((l) => {
    botoes[l].classList.toggle("ativo", l === letra);
  });
}

const sugerido = sugerirTreino(ultimoTreinoConcluido);
elSugerido.textContent = TREINOS[sugerido].nome;
elMotivo.textContent = ultimoTreinoConcluido
  ? `Seu último treino foi o ${ultimoTreinoConcluido}.`
  : "Ainda não há treinos concluídos.";

botoes.A.addEventListener("click", () => mostrarTreino("A"));
botoes.B.addEventListener("click", () => mostrarTreino("B"));

mostrarTreino(sugerido);

// ---------- Iniciar treino e registrar exercícios ----------

const telas = {
  inicial: document.getElementById("tela-inicial"),
  treino: document.getElementById("tela-treino"),
  exercicio: document.getElementById("tela-exercicio"),
};

// Mostra só uma tela e esconde as outras.
function mostrarTela(nome) {
  Object.keys(telas).forEach((n) => {
    telas[n].hidden = n !== nome;
  });
  window.scrollTo(0, 0);
}

// Registros digitados, só em memória por enquanto (somem ao recarregar a página).
// Chave: "A-0" (treino A, exercício 0) → lista de séries { reps, peso }.
const registros = {};
let exercicioAtual = null; // índice do exercício aberto

function chaveRegistro(letra, indice) {
  return `${letra}-${indice}`;
}

// "3x10-12" → 3 séries. Se não achar número, usa 3.
function contarSeries(texto) {
  const n = parseInt(texto, 10);
  return Number.isNaN(n) ? 3 : n;
}

function abrirTreino() {
  const treino = TREINOS[treinoAtual];
  document.getElementById("treino-em-andamento").textContent = treino.nome;

  const lista = document.getElementById("lista-treino");
  lista.innerHTML = "";
  treino.exercicios.forEach((ex, indice) => {
    const li = document.createElement("li");
    li.className = "toque";
    li.innerHTML = `
      <div class="exercicio-nome">${indice + 1}. ${ex.nome}</div>
      <div class="exercicio-series">${ex.series}</div>
    `;
    li.addEventListener("click", () => abrirExercicio(indice));
    lista.appendChild(li);
  });

  mostrarTela("treino");
}

// Cria uma linha de série (número, reps, peso) ligada ao registro em memória.
function criarLinhaSerie(serie, numero) {
  const linha = document.createElement("div");
  linha.className = "linha-serie";
  linha.innerHTML = `
    <div class="numero">Série ${numero}</div>
    <label>Reps<input type="number" inputmode="numeric" min="0" value="${serie.reps}"></label>
    <label>Peso (kg)<input type="number" inputmode="decimal" min="0" step="0.5" value="${serie.peso}"></label>
  `;
  const [campoReps, campoPeso] = linha.querySelectorAll("input");
  campoReps.addEventListener("input", () => { serie.reps = campoReps.value; });
  campoPeso.addEventListener("input", () => { serie.peso = campoPeso.value; });
  return linha;
}

function abrirExercicio(indice) {
  exercicioAtual = indice;
  const ex = TREINOS[treinoAtual].exercicios[indice];
  const chave = chaveRegistro(treinoAtual, indice);

  if (!registros[chave]) {
    registros[chave] = Array.from({ length: contarSeries(ex.series) }, () => ({ reps: "", peso: "" }));
  }

  document.getElementById("exercicio-nome").textContent = ex.nome;
  document.getElementById("exercicio-series").textContent = `Plano: ${ex.series}`;
  document.getElementById("exercicio-obs").textContent = ex.obs ? `⚠ ${ex.obs}` : "";

  const area = document.getElementById("linhas-series");
  area.innerHTML = "";
  registros[chave].forEach((serie, i) => area.appendChild(criarLinhaSerie(serie, i + 1)));

  mostrarTela("exercicio");
}

document.getElementById("botao-iniciar").addEventListener("click", abrirTreino);
document.getElementById("voltar-inicio").addEventListener("click", () => mostrarTela("inicial"));
document.getElementById("voltar-treino").addEventListener("click", () => mostrarTela("treino"));

document.getElementById("botao-add-serie").addEventListener("click", () => {
  const serie = { reps: "", peso: "" };
  const lista = registros[chaveRegistro(treinoAtual, exercicioAtual)];
  lista.push(serie);
  document.getElementById("linhas-series").appendChild(criarLinhaSerie(serie, lista.length));
});
