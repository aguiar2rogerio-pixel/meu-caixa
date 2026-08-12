// ===== MEU CAIXA — SISTEMA PREMIUM =====

const LIMITE_GRATUITO = 30;

function isUsuarioPremium() {
    return localStorage.getItem('meuCaixa_premium') === 'true';
}

function getContagemMesAtual() {
    const agora = new Date();
    const mes = agora.getMonth();
    const ano = agora.getFullYear();
    if (!dados || !dados.historico) return 0;
    return dados.historico.filter(item => {
        if (!item.data) return false;
        const [dia, m, a] = item.data.split('/');
        return parseInt(m) === (mes + 1) && parseInt(a) === ano;
    }).length;
}

function verificarStatusPremium() {
    const avisoEl = document.getElementById('aviso-premium');
    if (!avisoEl) return true;
    
    const contagem = getContagemMesAtual();

    if (isUsuarioPremium()) {
        avisoEl.classList.add('hidden');
        return true;
    }

    const restante = LIMITE_GRATUITO - contagem;
    if (restante <= 5 && restante > 0) {
        avisoEl.classList.remove('hidden');
        avisoEl.querySelector('p').innerHTML = `⚠️ Você tem mais <strong>${restante}</strong> lançamento${restante===1?'':'s'} este mês. <a href="paginas/premium.html" class="underline text-yellow-300">Desbloquear Premium →</a>`;
    } else if (restante <= 0) {
        avisoEl.classList.remove('hidden');
        avisoEl.querySelector('p').innerHTML = `🔒 Você atingiu o limite de ${LIMITE_GRATUITO} lançamentos do plano gratuito. <a href="paginas/premium.html" class="underline text-yellow-300">Desbloquear Premium →</a>`;
        const btnSalvar = document.getElementById('btn-salvar-principal');
        if (btnSalvar) btnSalvar.disabled = true;
    } else {
        avisoEl.classList.add('hidden');
    }
    return restante > 0 || isUsuarioPremium();
}

function desbloquearPremium(codigo) {
    const codigosValidos = ['MEUCAIXA2026', 'PREMIUM2026', 'MOTORISTA'];
    if (codigosValidos.includes(codigo.trim().toUpperCase())) {
        localStorage.setItem('meuCaixa_premium', 'true');
        alert('✅ Premium desbloqueado! Obrigado pelo apoio! 🚗💚');
        window.location.href = '../index.html';
        return true;
    } else {
        alert('❌ Código inválido. Verifique e tente novamente.');
        return false;
    }
}

window.isUsuarioPremium = isUsuarioPremium;
window.verificarStatusPremium = verificarStatusPremium;
window.desbloquearPremium = desbloquearPremium;
