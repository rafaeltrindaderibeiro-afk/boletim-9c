/* =========================================================
   BOLETIM DIGITAL — 9º ANO
   ========================================================= */

const CONFIG_ALUNO = {
  turma: "9C",
  numeroChamada: 14,
  apiUrl: "https://boletim-api.profbt.com.br"
};

let pinSessao = "";

/* ---------------------------------------------------------
   DADOS BRUTOS LOCAIS (PADRÃO)
   --------------------------------------------------------- */
const disciplinasLocais = [
  { disciplina: "Língua Portuguesa",                      tri1: 78,   tri2: "8,2", tri3: 8.6,  faltas: [2, 2, 1] },
  { disciplina: "Matemática",                             tri1: 55,   tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências",                               tri1: 84,   tri2: 7.9,   tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História",                               tri1: "7,1", tri2: 82,   tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia",                              tri1: 69,   tri2: "7,5", tri3: 7.8,  faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa",                         tri1: 88,   tri2: 8.4,   tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte",                                   tri1: "9,2", tri2: 87,   tri3: 9.0,  faltas: [1, 1, 0] },
  { disciplina: "Educação Física",                        tri1: 96,   tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital",                       tri1: 91,   tri2: 8.9,   tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira",                    tri1: 76,   tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática",                tri1: 58,   tri2: "5,9", tri3: 6.2,  faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72,   tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico",                      tri1: 49,   tri2: 5.5,   tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento",            tri1: "8,0", tri2: 84,   tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais",                 tri1: 64,   tri2: "6,6", tri3: 7.0,  faltas: [1, 1, 1] }
];

let dadosAtuais = [];

/* ---------------------------------------------------------
   VARIÁVEIS DE INSTÂNCIA DOS GRÁFICOS
   --------------------------------------------------------- */
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

/* ---------------------------------------------------------
   FUNÇÕES DE NORMALIZAÇÃO E CÁLCULO
   --------------------------------------------------------- */
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }

  const numero = Number(valor);
  if (isNaN(numero)) {
    return null;
  }

  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  return null;
}

function formatarNota(nota) {
  if (nota === null) return "Ainda não lançada";
  return nota.toFixed(1).replace(".", ",");
}

function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  if (validas.length === 0) return null;

  let soma = 0;
  for (let i = 0; i < validas.length; i++) {
    soma += validas[i];
  }
  return soma / validas.length;
}

function somarFaltas(lista) {
  if (!Array.isArray(lista)) return 0;
  let total = 0;
  for (let i = 0; i < lista.length; i++) {
    const f = Number(lista[i]);
    if (!isNaN(f)) total += f;
  }
  return total;
}

function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= 6) return "Bom desempenho";
  return "Atenção";
}

function classeDaSituacao(situacao) {
  if (situacao === "Bom desempenho") return "situacao-bom";
  if (situacao === "Atenção") return "situacao-atencao";
  return "situacao-neutra";
}

/* ---------------------------------------------------------
   FUNÇÕES DOS GRÁFICOS (SOMENTE LEITURA)
   --------------------------------------------------------- */
function atualizarGraficoMedias() {
  const ctx = document.getElementById("graficoMediasDisciplinas");
  if (!ctx) return;

  const labels = [];
  const medias = [];

  dadosAtuais.forEach(d => {
    labels.push(d.disciplina);
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);
    const media = calcularMedia([n1, n2, n3]);
    medias.push(media !== null ? Number(media.toFixed(1)) : null);
  });

  if (graficoMedias) {
    graficoMedias.destroy();
  }

  graficoMedias = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Média",
        data: medias,
        backgroundColor: "#d40000",
        borderColor: "#ff1a1a",
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 0,
          max: 10,
          grid: { color: "#222" },
          ticks: { color: "#aaa" }
        },
        y: {
          grid: { display: false },
          ticks: { color: "#fff", font: { size: 11 } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              return val !== null ? `Média: ${val.toFixed(1).replace(".", ",")}` : "Sem notas";
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const ctx = document.getElementById("graficoEvolucaoTrimestres");
  if (!ctx) return;

  let somaTri1 = 0, qtdTri1 = 0;
  let somaTri2 = 0, qtdTri2 = 0;
  let somaTri3 = 0, qtdTri3 = 0;

  dadosAtuais.forEach(d => {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);

    if (n1 !== null) { somaTri1 += n1; qtdTri1++; }
    if (n2 !== null) { somaTri2 += n2; qtdTri2++; }
    if (n3 !== null) { somaTri3 += n3; qtdTri3++; }
  });

  const mediaTri1 = qtdTri1 > 0 ? Number((somaTri1 / qtdTri1).toFixed(1)) : null;
  const mediaTri2 = qtdTri2 > 0 ? Number((somaTri2 / qtdTri2).toFixed(1)) : null;
  const mediaTri3 = qtdTri3 > 0 ? Number((somaTri3 / qtdTri3).toFixed(1)) : null;

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  graficoEvolucao = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Média Geral",
        data: [mediaTri1, mediaTri2, mediaTri3],
        borderColor: "#d40000",
        backgroundColor: "rgba(212, 0, 0, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.2,
        pointBackgroundColor: "#ff1a1a",
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {