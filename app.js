// Telas e botões. Os treinos e o armazenamento ficam em dados.js.

const telas = {
  inicial: document.getElementById("tela-inicial"),
  treino: document.getElementById("tela-treino"),
  exercicio: document.getElementById("tela-exercicio"),
  calendario: document.getElementById("tela-calendario"),
  ajustes: document.getElementById("tela-ajustes"),
};

// Qual aba da barra de baixo fica destacada em cada tela.
const abaDaTela = {
  inicial: "treino",
  treino: "treino",
  exercicio: "treino",
  calendario: "calendario",
  ajustes: "ajustes",
};

// Mostra só uma tela e esconde as outras.
function mostrarTela(nome) {
  Object.keys(telas).forEach((n) => {
    telas[n].hidden = n !== nome;
  });
  document.querySelectorAll("nav button").forEach((botao) => {
    botao.classList.toggle("ativo", botao.dataset.aba === abaDaTela[nome]);
  });
  if (nome === "inicial") atualizarSugestao();
  if (nome === "calendario") desenharCalendario();
  window.scrollTo(0, 0);
}

// "12×40kg" para cada série, separadas por " · ". Valores vazios aparecem como "–".
function descreverSeries(series) {
  return series.map((s) => `${s.reps ?? "–"}×${s.peso ?? "–"}kg`).join(" · ");
}

// ---------- Tela inicial ----------

const elSugerido = document.getElementById("treino-sugerido");
const elMotivo = document.getElementById("motivo-sugestao");
const elSemana = document.getElementById("resumo-semana");
const elTitulo = document.getElementById("titulo-treino");
const elDuracao = document.getElementById("duracao-treino");
const elLista = document.getElementById("lista-exercicios");
const botoes = {
  A: document.getElementById("botao-A"),
  B: document.getElementById("botao-B"),
};

// Qual treino está selecionado na tela inicial (A ou B).
let treinoAtual = null;

// Atualiza o cartão de sugestão com base no histórico.
function atualizarSugestao() {
  const ultimo = ultimoTreinoConcluido();
  const sugerido = sugerirTreino(ultimo ? ultimo.treino : null);
  elSugerido.textContent = TREINOS[sugerido].nome;
  elMotivo.textContent = ultimo
    ? `Seu último treino foi o ${ultimo.treino} (${formatarData(ultimo.data)}).`
    : "Ainda não há treinos concluídos.";
  elSemana.textContent = `Últimos 7 dias: ${treinosNosUltimosDias(7)} treino(s).`;
}

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

// Seleciona automaticamente o treino sugerido.
function selecionarSugerido() {
  const ultimo = ultimoTreinoConcluido();
  mostrarTreino(sugerirTreino(ultimo ? ultimo.treino : null));
}

botoes.A.addEventListener("click", () => mostrarTreino("A"));
botoes.B.addEventListener("click", () => mostrarTreino("B"));

// ---------- Treino em andamento ----------

let exercicioAtual = null; // índice do exercício aberto

function chaveRascunho(letra, indice) {
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

  const total = treino.exercicios.length;
  const feitos = exerciciosConcluidos(treinoAtual);
  document.getElementById("progresso-texto").textContent = `${feitos} de ${total} exercícios concluídos`;
  document.getElementById("progresso-barra").style.width = `${(feitos / total) * 100}%`;

  const lista = document.getElementById("lista-treino");
  lista.innerHTML = "";
  treino.exercicios.forEach((ex, indice) => {
    const registradas = seriesPreenchidas(treinoAtual, indice);
    const concluido = exercicioConcluido(treinoAtual, indice);
    const li = document.createElement("li");
    li.className = concluido ? "toque concluido" : "toque";
    li.innerHTML = `
      <div class="exercicio-nome">${concluido ? "✓ " : ""}${indice + 1}. ${ex.nome}</div>
      <div class="exercicio-series">${ex.series}</div>
      ${registradas > 0 ? `<div class="exercicio-feito">${registradas} série(s) registrada(s)</div>` : ""}
    `;
    li.addEventListener("click", () => abrirExercicio(indice));
    lista.appendChild(li);
  });

  mostrarTela("treino");
}

function concluirTreinoAtual() {
  const total = TREINOS[treinoAtual].exercicios.length;
  const feitos = exerciciosConcluidos(treinoAtual);
  let totalSeries = 0;
  TREINOS[treinoAtual].exercicios.forEach((ex, indice) => {
    totalSeries += seriesPreenchidas(treinoAtual, indice);
  });

  let aviso = `Concluir o ${TREINOS[treinoAtual].nome}?\n${feitos} de ${total} exercícios concluídos, ${totalSeries} série(s) registrada(s).`;
  if (totalSeries === 0 && feitos === 0) aviso = "Nenhuma série foi registrada. Concluir mesmo assim?";
  if (!confirm(aviso)) return;

  concluirTreino(treinoAtual);
  selecionarSugerido();
  mostrarTela("inicial");
}

document.getElementById("botao-iniciar").addEventListener("click", abrirTreino);
document.getElementById("voltar-inicio").addEventListener("click", () => mostrarTela("inicial"));
document.getElementById("voltar-treino").addEventListener("click", abrirTreino);
document.getElementById("botao-concluir").addEventListener("click", concluirTreinoAtual);

// ---------- Registro de um exercício ----------

const elUltimaVez = document.getElementById("ultima-vez");
const botaoRepetir = document.getElementById("repetir-ultima");
const botaoConcluirExercicio = document.getElementById("botao-concluir-exercicio");

function exercicioDaTela() {
  return TREINOS[treinoAtual].exercicios[exercicioAtual];
}

function listaDeSeries() {
  return dados.rascunho[chaveRascunho(treinoAtual, exercicioAtual)];
}

// Cria uma linha de série (número, reps, peso, remover) ligada ao rascunho salvo.
// "anterior" é a série correspondente da última vez, usada como dica nos campos.
function criarLinhaSerie(serie, indice, anterior, aoRemover) {
  const linha = document.createElement("div");
  linha.className = "linha-serie";
  linha.innerHTML = `
    <div class="numero">Série ${indice + 1}</div>
    <label>Reps<input type="number" inputmode="numeric" min="0"></label>
    <label>Peso (kg)<input type="number" inputmode="decimal" min="0" step="0.5"></label>
    <button type="button" class="remover" aria-label="Remover série ${indice + 1}">✕</button>
  `;
  const [campoReps, campoPeso] = linha.querySelectorAll("input");
  campoReps.value = serie.reps;
  campoPeso.value = serie.peso;
  if (anterior) {
    campoReps.placeholder = anterior.reps ?? "";
    campoPeso.placeholder = anterior.peso ?? "";
  }
  campoReps.addEventListener("input", () => {
    serie.reps = campoReps.value;
    salvarDados();
  });
  campoPeso.addEventListener("input", () => {
    serie.peso = campoPeso.value;
    salvarDados();
  });
  linha.querySelector(".remover").addEventListener("click", aoRemover);
  return linha;
}

// Redesenha todas as linhas de série do exercício aberto.
function desenharSeries() {
  const lista = listaDeSeries();
  const ultima = ultimaVezDoExercicio(exercicioDaTela().nome);
  const area = document.getElementById("linhas-series");
  area.innerHTML = "";
  lista.forEach((serie, i) => {
    const anterior = ultima ? ultima.series[i] : null;
    area.appendChild(
      criarLinhaSerie(serie, i, anterior, () => {
        lista.splice(i, 1);
        salvarDados();
        desenharSeries();
      })
    );
  });
}

function atualizarBotaoConcluirExercicio() {
  const concluido = exercicioConcluido(treinoAtual, exercicioAtual);
  botaoConcluirExercicio.textContent = concluido ? "✓ Concluído (toque para desmarcar)" : "Concluir exercício";
  botaoConcluirExercicio.classList.toggle("feito", concluido);
}

function abrirExercicio(indice) {
  exercicioAtual = indice;
  const ex = exercicioDaTela();
  const chave = chaveRascunho(treinoAtual, indice);

  if (!dados.rascunho[chave]) {
    dados.rascunho[chave] = Array.from({ length: contarSeries(ex.series) }, () => ({ reps: "", peso: "" }));
  }

  document.getElementById("exercicio-nome").textContent = ex.nome;
  document.getElementById("exercicio-series").textContent = `Plano: ${ex.series}`;
  document.getElementById("exercicio-obs").textContent = ex.obs ? `⚠ ${ex.obs}` : "";

  const ultima = ultimaVezDoExercicio(ex.nome);
  elUltimaVez.textContent = ultima
    ? `Última vez (${formatarData(ultima.data)}): ${descreverSeries(ultima.series)}`
    : "Primeira vez registrando este exercício.";
  botaoRepetir.hidden = !ultima;

  desenharSeries();
  atualizarBotaoConcluirExercicio();
  desenharDescanso();
  mostrarTela("exercicio");
}

// Preenche as séries com os valores da última vez (cria linhas extras se precisar).
botaoRepetir.addEventListener("click", () => {
  const ultima = ultimaVezDoExercicio(exercicioDaTela().nome);
  if (!ultima) return;
  const lista = listaDeSeries();
  ultima.series.forEach((anterior, i) => {
    if (!lista[i]) lista.push({ reps: "", peso: "" });
    lista[i].reps = anterior.reps === null || anterior.reps === undefined ? "" : String(anterior.reps);
    lista[i].peso = anterior.peso === null || anterior.peso === undefined ? "" : String(anterior.peso);
  });
  salvarDados();
  desenharSeries();
});

document.getElementById("botao-add-serie").addEventListener("click", () => {
  listaDeSeries().push({ reps: "", peso: "" });
  salvarDados();
  desenharSeries();
});

// Marca/desmarca o exercício. Ao marcar, volta para a lista do treino.
botaoConcluirExercicio.addEventListener("click", () => {
  const jaConcluido = exercicioConcluido(treinoAtual, exercicioAtual);
  definirExercicioConcluido(treinoAtual, exercicioAtual, !jaConcluido);

  if (jaConcluido) {
    atualizarBotaoConcluirExercicio();
    return;
  }
  abrirTreino();
});

// ---------- Cronômetro de descanso ----------

const elTempoDescanso = document.getElementById("descanso-tempo");
const botaoDescanso = document.getElementById("descanso-iniciar");

let descansoFim = null; // instante (ms) em que o descanso termina; null = parado
let descansoIntervalo = null;
let contextoAudio = null;

function formatarTempo(segundos) {
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
}

function segundosRestantes() {
  return Math.max(0, Math.ceil((descansoFim - Date.now()) / 1000));
}

function desenharDescanso() {
  const correndo = descansoFim !== null;
  elTempoDescanso.textContent = formatarTempo(correndo ? segundosRestantes() : dados.config.descanso);
  botaoDescanso.textContent = correndo ? "Parar descanso" : "Iniciar descanso";
}

function pararDescanso() {
  clearInterval(descansoIntervalo);
  descansoIntervalo = null;
  descansoFim = null;
  desenharDescanso();
}

// Apito curto + vibração (onde o aparelho suportar).
function avisarFimDescanso() {
  if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
  if (!contextoAudio) return;
  try {
    const oscilador = contextoAudio.createOscillator();
    oscilador.frequency.value = 880;
    oscilador.connect(contextoAudio.destination);
    oscilador.start();
    oscilador.stop(contextoAudio.currentTime + 0.5);
  } catch (erro) {
    // sem som, só a vibração
  }
}

function iniciarDescanso() {
  // O áudio precisa ser criado dentro de um toque do usuário, senão o navegador bloqueia.
  if (!contextoAudio && (window.AudioContext || window.webkitAudioContext)) {
    contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
  }
  descansoFim = Date.now() + dados.config.descanso * 1000;
  descansoIntervalo = setInterval(() => {
    if (segundosRestantes() <= 0) {
      avisarFimDescanso();
      pararDescanso();
    } else {
      desenharDescanso();
    }
  }, 250);
  desenharDescanso();
}

function ajustarDescanso(delta) {
  dados.config.descanso = Math.min(600, Math.max(15, dados.config.descanso + delta));
  salvarDados();
  desenharDescanso();
}

botaoDescanso.addEventListener("click", () => (descansoFim === null ? iniciarDescanso() : pararDescanso()));
document.getElementById("descanso-menos").addEventListener("click", () => ajustarDescanso(-15));
document.getElementById("descanso-mais").addEventListener("click", () => ajustarDescanso(15));

// ---------- Calendário ----------

const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

const hoje = new Date();
let mesVisto = { ano: hoje.getFullYear(), mes: hoje.getMonth() }; // mes: 0 a 11

function desenharCalendario() {
  const { ano, mes } = mesVisto;
  document.getElementById("mes-titulo").textContent = `${NOMES_MESES[mes]} de ${ano}`;
  document.getElementById("dia-detalhe").hidden = true;

  // Dia (AAAA-MM-DD) → letras dos treinos feitos naquele dia.
  const treinosPorDia = {};
  let totalNoMes = 0;
  const prefixo = `${ano}-${String(mes + 1).padStart(2, "0")}-`;
  dados.historico.forEach((sessao) => {
    if (!sessao.data.startsWith(prefixo)) return;
    (treinosPorDia[sessao.data] = treinosPorDia[sessao.data] || []).push(sessao.treino);
    totalNoMes += 1;
  });

  const grade = document.getElementById("calendario-grade");
  grade.innerHTML = "";

  DIAS_SEMANA.forEach((letra) => {
    const cab = document.createElement("div");
    cab.className = "dia-semana";
    cab.textContent = letra;
    grade.appendChild(cab);
  });

  const primeiroDia = new Date(ano, mes, 1).getDay(); // 0 = domingo
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  for (let i = 0; i < primeiroDia; i++) {
    grade.appendChild(document.createElement("div"));
  }

  const hojeTexto = dataLocal();
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const textoData = `${prefixo}${String(dia).padStart(2, "0")}`;
    const celula = document.createElement("div");
    celula.className = "dia";
    if (textoData === hojeTexto) celula.classList.add("hoje");

    const numero = document.createElement("span");
    numero.textContent = dia;
    celula.appendChild(numero);

    const feitos = treinosPorDia[textoData];
    if (feitos) {
      celula.classList.add("treinou", "toque");
      const marca = document.createElement("span");
      marca.className = "marca";
      marca.textContent = feitos.join("+");
      celula.appendChild(marca);
      celula.addEventListener("click", () => mostrarDetalheDia(textoData));
    }
    grade.appendChild(celula);
  }

  document.getElementById("mes-resumo").textContent =
    totalNoMes === 0 ? "Nenhum treino neste mês." : `${totalNoMes} treino(s) neste mês. Toque num dia marcado para ver os detalhes.`;
}

// Mostra o que foi feito no dia tocado, com opção de excluir o treino.
function mostrarDetalheDia(textoData) {
  const painel = document.getElementById("dia-detalhe");
  painel.innerHTML = "";

  const titulo = document.createElement("h2");
  titulo.textContent = formatarData(textoData);
  painel.appendChild(titulo);

  dados.historico
    .filter((sessao) => sessao.data === textoData)
    .forEach((sessao) => {
      const bloco = document.createElement("div");
      bloco.className = "sessao";

      const nome = document.createElement("div");
      nome.className = "exercicio-nome";
      nome.textContent = TREINOS[sessao.treino].nome;
      bloco.appendChild(nome);

      const exercicios = Array.isArray(sessao.exercicios) ? sessao.exercicios : [];
      if (exercicios.length === 0) {
        const vazio = document.createElement("div");
        vazio.className = "exercicio-alternativa";
        vazio.textContent = "Nenhuma série registrada.";
        bloco.appendChild(vazio);
      }
      exercicios.forEach((ex) => {
        const linha = document.createElement("div");
        linha.className = "exercicio-alternativa";
        const series = Array.isArray(ex.series) ? ex.series : [];
        linha.textContent = `${ex.concluido ? "✓ " : ""}${ex.nome}${series.length ? `: ${descreverSeries(series)}` : ""}`;
        bloco.appendChild(linha);
      });

      const excluir = document.createElement("button");
      excluir.type = "button";
      excluir.className = "perigo";
      excluir.textContent = "Excluir este treino";
      excluir.addEventListener("click", () => {
        if (!confirm(`Excluir o ${TREINOS[sessao.treino].nome} de ${formatarData(textoData)}? Isso não pode ser desfeito.`)) return;
        excluirSessao(sessao);
        selecionarSugerido();
        desenharCalendario();
      });
      bloco.appendChild(excluir);

      painel.appendChild(bloco);
    });

  painel.hidden = false;
}

function mudarMes(delta) {
  const nova = new Date(mesVisto.ano, mesVisto.mes + delta, 1);
  mesVisto = { ano: nova.getFullYear(), mes: nova.getMonth() };
  desenharCalendario();
}

document.getElementById("mes-anterior").addEventListener("click", () => mudarMes(-1));
document.getElementById("mes-proximo").addEventListener("click", () => mudarMes(1));

// ---------- Ajustes: backup ----------

const elMensagem = document.getElementById("ajustes-mensagem");
const campoArquivo = document.getElementById("arquivo-importar");

document.getElementById("botao-exportar").addEventListener("click", () => {
  exportarBackup();
  elMensagem.textContent = `Backup exportado com ${dados.historico.length} treino(s).`;
});

document.getElementById("botao-importar").addEventListener("click", () => campoArquivo.click());

campoArquivo.addEventListener("change", async () => {
  const arquivo = campoArquivo.files[0];
  campoArquivo.value = ""; // permite escolher o mesmo arquivo de novo depois
  if (!arquivo) return;

  try {
    const sessoes = lerBackup(await arquivo.text());
    const aviso = `Importar ${sessoes.length} treino(s)? Isso substitui o histórico atual (${dados.historico.length} treino(s)).`;
    if (!confirm(aviso)) {
      elMensagem.textContent = "Importação cancelada.";
      return;
    }
    substituirHistorico(sessoes);
    selecionarSugerido();
    elMensagem.textContent = `Backup importado: ${sessoes.length} treino(s).`;
  } catch (erro) {
    elMensagem.textContent = `Erro ao importar: ${erro.message}`;
  }
});

// ---------- Barra de navegação e início ----------

document.querySelectorAll("nav button").forEach((botao) => {
  botao.addEventListener("click", () => {
    const aba = botao.dataset.aba;
    mostrarTela(aba === "treino" ? "inicial" : aba);
  });
});

selecionarSugerido();
atualizarSugestao();

// Ativa o funcionamento offline (só funciona no site publicado, não abrindo o arquivo direto).
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
