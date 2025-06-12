
// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA3OnZGxbxAkP8v2tgbtfTSJ6rU5Vpn8VU",
  authDomain: "bateumolhou.firebaseapp.com",
  databaseURL: "https://bateumolhou-default-rtdb.firebaseio.com",
  projectId: "bateumolhou",
  storageBucket: "bateumolhou.firebasestorage.app",
  messagingSenderId: "5584868306",
  appId: "1:5584868306:web:0e9c5607fae01c22282e0b",
  measurementId: "G-8Z9QPXPKBS"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let codigoSala = "";
let desafios = [];
let jogadorId = "user" + Math.floor(Math.random() * 9999);
let fase = 0;

// Desafios padrão
const desafiosBase = [
  { pergunta: "Qual é a capital do Brasil?", resposta: "Brasília" },
  { pergunta: "Quanto é 5 + 7?", resposta: "12" },
  { pergunta: "Cor do céu sem nuvens?", resposta: "azul" },
  { pergunta: "Qual é o oposto de quente?", resposta: "frio" },
  { pergunta: "2 x 3?", resposta: "6" },
  { pergunta: "A água ferve a quantos °C?", resposta: "100" },
  { pergunta: "Maior planeta do sistema solar?", resposta: "Júpiter" },
  { pergunta: "Animal que mia?", resposta: "gato" },
  { pergunta: "5 ao quadrado?", resposta: "25" },
  { pergunta: "Quantos dias tem uma semana?", resposta: "7" },
];

function criarSala() {
  codigoSala = Math.random().toString(36).substring(2, 7).toUpperCase();
  desafios = desafiosBase.sort(() => Math.random() - 0.5).slice(0, 10);
  db.ref("salas/" + codigoSala).set({
    jogadores: { [jogadorId]: { acertos: 0 } },
    desafios: desafios,
  });
  iniciarJogo();
}

function entrarNaSala() {
  const input = document.getElementById("codigoSala").value.toUpperCase();
  db.ref("salas/" + input).once("value", snapshot => {
    if (snapshot.exists()) {
      codigoSala = input;
      desafios = snapshot.val().desafios;
      db.ref("salas/" + codigoSala + "/jogadores/" + jogadorId).set({ acertos: 0 });
      iniciarJogo();
    } else {
      alert("Sala não encontrada.");
    }
  });
}

function buscarPartidaOnline() {
  db.ref("salas").once("value", snapshot => {
    let entrou = false;
    snapshot.forEach(salaSnap => {
      const sala = salaSnap.val();
      if (Object.keys(sala.jogadores || {}).length < 4) {
        codigoSala = salaSnap.key;
        desafios = sala.desafios;
        db.ref("salas/" + codigoSala + "/jogadores/" + jogadorId).set({ acertos: 0 });
        iniciarJogo();
        entrou = true;
        return true;
      }
    });
    if (!entrou) criarSala();
  });
}

function iniciarJogo() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";
  fase = 0;
  mostrarDesafio();
}

function mostrarDesafio() {
  if (fase >= desafios.length) return mostrarRanking();
  document.getElementById("faseAtual").innerText = `Desafio ${fase + 1}/10`;
  document.getElementById("desafio").innerText = desafios[fase].pergunta;
  document.getElementById("resposta").value = "";
  document.getElementById("feedback").innerText = "";
}

function enviarResposta() {
  const resposta = document.getElementById("resposta").value.trim().toLowerCase();
  const respostaCerta = desafios[fase].resposta.trim().toLowerCase();
  if (resposta === respostaCerta) {
    document.getElementById("feedback").innerText = "Correto!";
    db.ref("salas/" + codigoSala + "/jogadores/" + jogadorId + "/acertos").get().then(snap => {
      const acertos = (snap.val() || 0) + 1;
      db.ref("salas/" + codigoSala + "/jogadores/" + jogadorId + "/acertos").set(acertos);
    });
  } else {
    document.getElementById("feedback").innerText = "Errado!";
  }
  fase++;
  setTimeout(mostrarDesafio, 1000);
}

function mostrarRanking() {
  document.getElementById("jogo").style.display = "none";
  document.getElementById("ranking").style.display = "block";
  const lista = document.getElementById("rankingLista");
  lista.innerHTML = "";
  db.ref("salas/" + codigoSala + "/jogadores").once("value", snap => {
    const ranking = [];
    snap.forEach(jogador => {
      ranking.push({ nome: jogador.key, pontos: jogador.val().acertos });
    });
    ranking.sort((a, b) => b.pontos - a.pontos);
    ranking.forEach(j => {
      const li = document.createElement("li");
      li.textContent = `${j.nome} - ${j.pontos} pontos`;
      lista.appendChild(li);
    });
  });
}
