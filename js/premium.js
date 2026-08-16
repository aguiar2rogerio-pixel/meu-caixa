// ===== MEU CAIXA — TESTE E ACESSO COMPLETO =====

const LIMITE_FECHAMENTOS_TESTE = 30;
const DURACAO_TESTE_DIAS = 30;
const CHAVE_ESTADO_TESTE = 'meuCaixa_estadoTeste';

function obterEstadoTeste() {
    try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_ESTADO_TESTE) || 'null');
        if (salvo && typeof salvo === 'object') {
            return {
                iniciadoEm: salvo.iniciadoEm || null,
                fechamentosUsados: Number(salvo.fechamentosUsados) || 0
            };
        }
    } catch (erro) {
        localStorage.removeItem(CHAVE_ESTADO_TESTE);
    }
    return { iniciadoEm: null, fechamentosUsados: 0 };
}

function salvarEstadoTeste(estado) {
    localStorage.setItem(CHAVE_ESTADO_TESTE, JSON.stringify(estado));
}

function iniciarTesteSeNecessario() {
    const estado = obterEstadoTeste();
    if (!estado.iniciadoEm) {
        estado.iniciadoEm = new Date().toISOString();
        salvarEstadoTeste(estado);
    }
    return estado;
}

function isUsuarioPremium() {
    return localStorage.getItem('meuCaixa_premium') === 'true';
}

function diasRestantesTeste(estado = iniciarTesteSeNecessario()) {
    const inicio = new Date(estado.iniciadoEm);
    if (Number.isNaN(inicio.getTime())) return 0;
    const expiracao = inicio.getTime() + DURACAO_TESTE_DIAS * 24 * 60 * 60 * 1000;
    return Math.max(0, Math.ceil((expiracao - Date.now()) / (24 * 60 * 60 * 1000)));
}

function testeExpirou(estado = iniciarTesteSeNecessario()) {
    return diasRestantesTeste(estado) <= 0 || estado.fechamentosUsados >= LIMITE_FECHAMENTOS_TESTE;
}

function podeSalvarNovoLancamento() {
    if (isUsuarioPremium()) return true;
    const estado = iniciarTesteSeNecessario();
    return !testeExpirou(estado);
}

function registrarFechamentoTeste() {
    if (isUsuarioPremium()) return;
    const estado = iniciarTesteSeNecessario();
    estado.fechamentosUsados += 1;
    salvarEstadoTeste(estado);
}

function textoLinkAcessoCompleto() {
    return '<a href="paginas/premium.html" class="underline text-yellow-300">Liberar acesso completo →</a>';
}

function verificarStatusPremium() {
    const avisoEl = document.getElementById('aviso-premium');
    if (!avisoEl) return true;
    if (isUsuarioPremium()) {
        avisoEl.classList.add('hidden');
        return true;
    }

    const estado = iniciarTesteSeNecessario();
    const dias = diasRestantesTeste(estado);
    const fechamentosRestantes = Math.max(0, LIMITE_FECHAMENTOS_TESTE - estado.fechamentosUsados);
    const expirado = testeExpirou(estado);
    const btnSalvar = document.getElementById('btn-salvar-principal');

    avisoEl.classList.remove('hidden');
    if (expirado) {
        avisoEl.className = 'mb-3 p-3 bg-red-950 border border-red-600 rounded-xl text-center';
        avisoEl.querySelector('p').innerHTML = `🔒 Seu período de teste terminou. ${textoLinkAcessoCompleto()}`;
        if (btnSalvar) btnSalvar.disabled = true;
    } else {
        avisoEl.className = 'mb-3 p-3 bg-yellow-950 border border-yellow-600 rounded-xl text-center';
        avisoEl.querySelector('p').innerHTML = `Versão de teste: <strong>${dias} dia${dias === 1 ? '' : 's'}</strong> ou <strong>${fechamentosRestantes} fechamento${fechamentosRestantes === 1 ? '' : 's'}</strong> restante${fechamentosRestantes === 1 ? '' : 's'}. ${textoLinkAcessoCompleto()}`;
    }
    return !expirado;
}

// Compatibilidade temporária com ativações locais antigas. Não é o mecanismo comercial definitivo.
function desbloquearPremium(codigo) {
    const codigoNormalizado = String(codigo || '').trim().toUpperCase();
    if (codigoNormalizado === 'MEUCAIXA2026') {
        localStorage.setItem('meuCaixa_premium', 'true');
        alert('Acesso completo ativado neste dispositivo.');
        window.location.href = '../index.html';
        return true;
    }
    alert('Código inválido.');
    return false;
}

window.isUsuarioPremium = isUsuarioPremium;
window.verificarStatusPremium = verificarStatusPremium;
window.podeSalvarNovoLancamento = podeSalvarNovoLancamento;
window.registrarFechamentoTeste = registrarFechamentoTeste;
window.desbloquearPremium = desbloquearPremium;
