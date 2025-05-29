const form = document.getElementById("dev-form");
const nomeInput = document.getElementById("nome");
const horasInput = document.getElementById("horas");
const producoesInput = document.getElementById("producoes");
const descricaoInput = document.getElementById("descricao");
const rankingDiv = document.getElementById("ranking");

let devs = JSON.parse(localStorage.getItem("devs")) || [];

function calcularProdutividade(dev) {
  return dev.horas * 1 + dev.producoes * 2;
}

function salvarDados() {
  localStorage.setItem("devs", JSON.stringify(devs));
}

function deletarDev(index) {
  if (confirm(`Deseja mesmo remover ${devs[index].nome}?`)) {
    devs.splice(index, 1);
    salvarDados();
    atualizarRanking();
  }
}

function atualizarRanking() {
  rankingDiv.innerHTML = "";

  devs.sort((a, b) => calcularProdutividade(b) - calcularProdutividade(a));

  devs.forEach((dev, index) => {
    const card = document.createElement("div");
    card.className = "dev-card";

    if (index === 0) card.classList.add("top");
    if (index === devs.length - 1) card.classList.add("low");

    card.innerHTML = `
      <div class="dev-header">
        <span><strong>👤 ${dev.nome}</strong></span>
        <button onclick="deletarDev(${index})" class="delete-btn">❌</button>
      </div>
      <div id="info-dev">
        <span>⏱️ ${dev.horas}h | 📦 ${dev.producoes} prod. | ⚡ ${calcularProdutividade(dev)} pts</span><br>
        <p style="margin-top: 10px; font-size: 13px;">📝 ${dev.descricao || "Sem descrição registrada."}</p>
      </div>
    `;
    rankingDiv.appendChild(card);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const horas = parseInt(horasInput.value);
  const producoes = parseInt(producoesInput.value);
  const descricao = descricaoInput.value.trim();

  if (!nome || isNaN(horas) || isNaN(producoes)) return;

  const index = devs.findIndex(dev => dev.nome.toLowerCase() === nome.toLowerCase());

  if (index >= 0) {
    // Atualização cumulativa
    devs[index].horas += horas;
    devs[index].producoes += producoes;
    devs[index].descricao += descricao ? ` | ${descricao}` : "";
  } else {
    devs.push({ nome, horas, producoes, descricao });
  }

  salvarDados();
  atualizarRanking();
  form.reset();
});

atualizarRanking();


// Exportar dados como JSON
function baixarJSON() {
  const dataStr = JSON.stringify(devs, null, 2);
  const blob = new Blob([dataStr], {type: "application/json"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "produtividade_devs.json";
  document.body.appendChild(a);
  a.click(); // força o download
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // limpa a URL criada
}

// Importar JSON e atualizar localStorage
document.getElementById("importarJSON").addEventListener("change", function (event) {
  const file = event.target.files[0]; //Indica quantos arquivos aceita (somente 1)
  if (!file) return; //se nada é selecionado. Para aqui.

  const reader = new FileReader(); //Cria o objeto para ler o conteúdo.
  reader.onload = function (e) { //abre a função
    try { 
      const importedData = JSON.parse(e.target.result); //Pega o conteúdo e transforma em objeto

      if (!Array.isArray(importedData)) {
        alert("Formato de arquivo inválido!");
        return;
      }

      // Substituir os dados existentes
      devs = importedData;
      salvarDados();
      atualizarRanking();
      alert("Dados importados com sucesso!");
    } catch (err) {
      alert("Erro ao importar o arquivo JSON.");
    }
  };
  reader.readAsText(file);
});

function resetarTudo() {
  if (confirm("Tem certeza que deseja começar um novo arquivo? Isso apagará todos os dados salvos.")) {
    localStorage.removeItem("devs");
    devs = [];
    atualizarRanking();
    alert("Todos os dados foram apagados.");
  }
}