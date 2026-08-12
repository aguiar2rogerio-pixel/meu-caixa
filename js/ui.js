// ======================
// GERENCIAMENTO DA INTERFACE — MEU CAIXA
// Liga todos os botões e elementos da tela
// ======================

// Elementos da Tela
const elements = {
  // Formulário de Registro
  formRegistro: document.getElementById('form-registro'),
  tipoLancamento: document.getElementById('tipo-lancamento'),
  descricao: document.getElementById('descricao'),
  valor: document.getElementById('valor'),
  data: document.getElementById('data'),
  btnSalvar: document.getElementById('btn-salvar'),

  // Filtros
  filtroMes: document.getElementById('filtro-mes'),
  filtroAno: document.getElementById('filtro-ano'),
  btnFiltrar: document.getElementById('btn-filtrar'),
  btnLimparFiltro: document.getElementById('btn-limpar-filtro'),

  // Resumo / Saldo
  saldoTotal: document.getElementById('saldo-total'),
  totalEntradas: document.getElementById('total-entradas'),
  totalSaidas: document.getElementById('total-saidas'),
  saldoMes: document.getElementById('saldo-mes'),

  // Lista de Lançamentos
  listaLancamentos: document.getElementById('lista-lancamentos'),
  semRegistros: document.getElementById('sem-registros'),

  // Premium
  btnPremium: document.getElementById('btn-premium'),
  avisoPremium: document.getElementById('aviso-premium'),
  btnFecharAviso: document.getElementById('btn-fechar-aviso'),

  // Navegação
  linkPrivacidade: document.getElementById('link-privacidade')
};

// ======================
// INICIALIZA TODOS OS EVENTOS DOS BOTÕES
// ======================
function inicializarUI() {
  // Formulário — Salvar lançamento
  if (elements.formRegistro) {
    elements.formRegistro.addEventListener('submit', aoSubmeterRegistro);
  }

  // Botões de filtro
  if (elements.btnFiltrar) {
    elements.btnFiltrar.addEventListener('click', aplicarFiltros);
  }
  if (elements.btnLimparFiltro) {
    elements.btnLimparFiltro.addEventListener('click', limparFiltros);
  }

  // Botão Premium
  if (elements.btnPremium) {
    elements.btnPremium.addEventListener('click', () => {
      window.location.href = 'paginas/premium.html';
    });
  }

  // Aviso Premium
  if (elements.btnFecharAviso) {
    elements.btnFecharAviso.addEventListener('click', () => {
      if (elements.avisoPremium) elements.avisoPremium.style.display = 'none';
    });
  }

  // Link Privacidade
  if (elements.linkPrivacidade) {
    elements.linkPrivacidade.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'privacidade.html';
    });
  }

  // Define data de hoje automaticamente
  if (elements.data) {
    const hoje = new Date().toISOString().split('T')[0];
    elements.data.value = hoje;
  }

  preencherFiltrosMesAno();
  carregarDadosNaTela();
}

// ======================
// SALVAR REGISTRO
// ======================
function aoSubmeterRegistro(e) {
  e.preventDefault();

  const tipo = elements.tipoLancamento.value;
  const desc = elements.descricao.value.trim();
  const val = parseFloat(elements.valor.value);
  const dt = elements.data.value;

  if (!desc || isNaN(val) || val <= 0) {
    alert('Preencha todos os campos corretamente!');
    return;
  }

  const registro = {
    id: Date.now(),
    tipo,
    descricao: desc,
    valor: val,
    data: dt
  };

  // Salva no storage
  salvarRegistro(registro);

  // Limpa formulário
  elements.descricao.value = '';
  elements.valor.value = '';

  // Atualiza tela
  carregarDadosNaTela();

  alert('✅ Lançamento salvo com sucesso!');
}

// ======================
// CARREGAR DADOS NA TELA
// ======================
function carregarDadosNaTela() {
  const registros = obterRegistros();
  const filtro = obterFiltros();
  let dadosFiltrados = registros;

  if (filtro.mes && filtro.ano) {
    dadosFiltrados = registros.filter(r => {
      const d = new Date(r.data);
      return (d.getMonth() + 1) === parseInt(filtro.mes) &&
             d.getFullYear() === parseInt(filtro.ano);
    });
  }

  // Atualiza resumo
  atualizarResumo(dadosFiltrados);

  // Renderiza lista
  renderizarLista(dadosFiltrados);
}

// ======================
// ATUALIZA RESUMO FINANCEIRO
// ======================
function atualizarResumo(lista) {
  const entradas = lista.filter(r => r.tipo === 'entrada').reduce((s, r) => s + r.valor, 0);
  const saidas = lista.filter(r => r.tipo === 'saida').reduce((s, r) => s + r.valor, 0);
  const saldo = entradas - saidas;

  if (elements.totalEntradas) elements.totalEntradas.textContent = formatarMoeda(entradas);
  if (elements.totalSaidas) elements.totalSaidas.textContent = formatarMoeda(saidas);
  if (elements.saldoTotal) elements.saldoTotal.textContent = formatarMoeda(saldo);
  if (elements.saldoMes) elements.saldoMes.textContent = formatarMoeda(saldo);
}

// ======================
// RENDERIZA LISTA DE LANÇAMENTOS
// ======================
function renderizarLista(lista) {
  if (!elements.listaLancamentos) return;

  elements.listaLancamentos.innerHTML = '';

  if (lista.length === 0) {
    if (elements.semRegistros) elements.semRegistros.style.display = 'block';
    return;
  }

  if (elements.semRegistros) elements.semRegistros.style.display = 'none';

  // Ordena por data (mais recente primeiro)
  lista.sort((a, b) => new Date(b.data) - new Date(a.data));

  lista.forEach(reg => {
    const item = document.createElement('div');
    item.className = `lancamento ${reg.tipo}`;
    item.innerHTML = `
      <div class="info">
        <strong>${reg.descricao}</strong>
        <small>${formatarData(reg.data)}</small>
      </div>
      <div class="valor">${formatarMoeda(reg.valor)}</div>
      <button class="btn-excluir" data-id="${reg.id}">🗑️</button>
    `;
    elements.listaLancamentos.appendChild(item);
  });

  // Botões excluir
  document.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      if (confirm('Tem certeza que deseja excluir este registro?')) {
        excluirRegistro(id);
        carregarDadosNaTela();
      }
    });
  });
}

// ======================
// FILTROS — Mês / Ano
// ======================
function preencherFiltrosMesAno() {
  if (!elements.filtroMes || !elements.filtroAno) return;

  const meses = [
    ['01','Janeiro'],['02','Fevereiro'],['03','Março'],['04','Abril'],
    ['05','Maio'],['06','Junho'],['07','Julho'],['08','Agosto'],
    ['09','Setembro'],['10','Outubro'],['11','Novembro'],['12','Dezembro']
  ];

  elements.filtroMes.innerHTML = '<option value="">Todos</option>';
  meses.forEach(([valor, nome]) => {
    elements.filtroMes.innerHTML += `<option value="${valor}">${nome}</option>`;
  });

  const anoAtual = new Date().getFullYear();
  elements.filtroAno.innerHTML = '<option value="">Todos</option>';
  for (let a = anoAtual - 2; a <= anoAtual + 1; a++) {
    elements.filtroAno.innerHTML += `<option value="${a}">${a}</option>`;
  }
}

function aplicarFiltros() {
  const mes = elements.filtroMes?.value || '';
  const ano = elements.filtroAno?.value || '';
  salvarFiltros({ mes, ano });
  carregarDadosNaTela();
}

function limparFiltros() {
  if (elements.filtroMes) elements.filtroMes.value = '';
  if (elements.filtroAno) elements.filtroAno.value = '';
  salvarFiltros({ mes: '', ano: '' });
  carregarDadosNaTela();
}

// ======================
// FORMATADORES
// ======================
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

// ======================
// INICIALIZA TUDO AO CARREGAR A PÁGINA
// ======================
document.addEventListener('DOMContentLoaded', inicializarUI);
