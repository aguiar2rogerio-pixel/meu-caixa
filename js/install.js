(() => {
    let deferredPrompt = null;

    function criarInterfaceInstalacao() {
        if (document.getElementById('btn-instalar-pwa')) return;

        const botao = document.createElement('button');
        botao.id = 'btn-instalar-pwa';
        botao.type = 'button';
        botao.className = 'fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-500 px-4 py-3 text-xs font-black text-slate-950 shadow-xl shadow-emerald-950/40 transition hover:bg-emerald-400';
        botao.innerHTML = '<span aria-hidden="true">⇩</span><span>Instalar aplicativo</span>';
        botao.setAttribute('aria-label', 'Ver instruções para instalar o Meu Caixa');
        botao.addEventListener('click', abrirOrientacoesInstalacao);
        document.body.appendChild(botao);

        const modal = document.createElement('div');
        modal.id = 'modal-instalacao-pwa';
        modal.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-black/75 p-4';
        modal.innerHTML = `
            <div class="w-full max-w-md rounded-3xl border border-emerald-400/30 bg-slate-950 p-6 text-left shadow-2xl">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Instalação fácil</p>
                        <h2 class="mt-2 text-2xl font-black text-white">Leve o Meu Caixa para a tela inicial</h2>
                    </div>
                    <button type="button" data-fechar-instalacao class="text-2xl leading-none text-slate-500 hover:text-white" aria-label="Fechar">×</button>
                </div>
                <div class="mt-5 space-y-4 text-sm leading-relaxed text-slate-300">
                    <p><strong class="text-white">1.</strong> Toque em <strong class="text-emerald-300">Instalar agora</strong>. Se o Android abrir a confirmação, aceite a instalação.</p>
                    <p><strong class="text-white">2.</strong> Se não aparecer a instalação automática, abra o menu de três pontos do navegador e escolha <strong class="text-emerald-300">Instalar aplicativo</strong> ou <strong class="text-emerald-300">Adicionar à tela inicial</strong>.</p>
                    <p><strong class="text-white">3.</strong> Em alguns celulares, o Google Play Protect pode mostrar um aviso porque o aplicativo foi instalado fora da Play Store. Toque em <strong class="text-emerald-300">Mais detalhes</strong> e depois em <strong class="text-emerald-300">Instalar assim mesmo</strong>, somente conferindo se você está no endereço oficial do Meu Caixa.</p>
                </div>
                <div class="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
                    <button type="button" data-instalar-agora class="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400">Instalar agora</button>
                    <button type="button" data-fechar-instalacao class="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white">Entendi</button>
                </div>
            </div>`;
        document.body.appendChild(modal);

        modal.querySelectorAll('[data-fechar-instalacao]').forEach(elemento => {
            elemento.addEventListener('click', fecharOrientacoesInstalacao);
        });
        modal.querySelector('[data-instalar-agora]').addEventListener('click', instalarAgora);
        modal.addEventListener('click', evento => {
            if (evento.target === modal) fecharOrientacoesInstalacao();
        });
    }

    function abrirOrientacoesInstalacao() {
        const modal = document.getElementById('modal-instalacao-pwa');
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function fecharOrientacoesInstalacao() {
        const modal = document.getElementById('modal-instalacao-pwa');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    async function instalarAgora() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            fecharOrientacoesInstalacao();
            return;
        }
        fecharOrientacoesInstalacao();
    }

    window.addEventListener('beforeinstallprompt', evento => {
        evento.preventDefault();
        deferredPrompt = evento;
    });

    window.addEventListener('appinstalled', () => {
        const botao = document.getElementById('btn-instalar-pwa');
        if (botao) {
            botao.innerHTML = '<span aria-hidden="true">✓</span><span>Aplicativo instalado</span>';
            botao.disabled = true;
            botao.classList.remove('bg-emerald-500', 'text-slate-950');
            botao.classList.add('border-slate-700', 'bg-slate-900', 'text-emerald-300');
        }
    });

    document.addEventListener('DOMContentLoaded', criarInterfaceInstalacao);
})();
