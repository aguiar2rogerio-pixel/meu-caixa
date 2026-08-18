(() => {
    function criarManual() {
        if (document.getElementById('modal-manual')) return;

        const modal = document.createElement('div');
        modal.id = 'modal-manual';
        modal.className = 'fixed inset-0 z-[60] hidden items-center justify-center bg-black/80 p-4';
        modal.innerHTML = `
            <div class="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-3xl border border-blue-400/30 bg-gray-950 p-5 text-left shadow-2xl">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[.18em] text-blue-400">Ajuda rápida</p>
                        <h2 class="mt-1 text-xl font-black text-white">Como usar o Meu Caixa</h2>
                    </div>
                    <button type="button" data-fechar-manual class="text-2xl leading-none text-gray-500 hover:text-white" aria-label="Fechar manual">×</button>
                </div>
                <div class="mt-5 space-y-5 text-xs leading-relaxed text-gray-300">
                    <section>
                        <h3 class="font-black uppercase tracking-wider text-green-400">1. Lance o seu dia</h3>
                        <p class="mt-1">Informe o faturamento, a renda extra, o combustível, os gastos pessoais, o fundo de emergência e a poupança. Para detalhar os gastos, toque em <strong class="text-white">Detalhar</strong>.</p>
                    </section>
                    <section>
                        <h3 class="font-black uppercase tracking-wider text-blue-400">2. Feche o dia</h3>
                        <p class="mt-1">Toque em <strong class="text-white">Salvar e Fechar o Dia</strong>. Depois da confirmação, novos lançamentos para aquela data ficam bloqueados. Use <strong class="text-white">Ajustar</strong> se precisar corrigir o movimento.</p>
                    </section>
                    <section>
                        <h3 class="font-black uppercase tracking-wider text-yellow-400">3. Feche o mês</h3>
                        <p class="mt-1">Quando o período terminar, toque em <strong class="text-white">Fechar Balanço Mensal</strong> para arquivar o resumo e consultar o histórico dos meses anteriores.</p>
                    </section>
                    <section>
                        <h3 class="font-black uppercase tracking-wider text-orange-400">4. Faça backups</h3>
                        <p class="mt-1">Use <strong class="text-white">Salvar Backup</strong> antes de trocar de navegador, trocar de celular ou limpar os dados. Para recuperar os lançamentos, use <strong class="text-white">Ler Backup</strong>. O backup também preserva a situação do período de teste.</p>
                    </section>
                    <section>
                        <h3 class="font-black uppercase tracking-wider text-emerald-400">5. Instale no celular</h3>
                        <p class="mt-1">Toque em <strong class="text-white">Instalar aplicativo</strong>. Se o navegador não oferecer a instalação, abra o menu de três pontos e escolha <strong class="text-white">Instalar aplicativo</strong> ou <strong class="text-white">Adicionar à tela inicial</strong>.</p>
                    </section>
                    <section>
                        <h3 class="font-black uppercase tracking-wider text-purple-400">6. Acesso completo</h3>
                        <p class="mt-1">O período de teste informa o prazo e os fechamentos restantes. Se comprar o acesso completo em outro navegador, restaure primeiro o backup para recuperar seus dados.</p>
                    </section>
                    <div class="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-yellow-200">
                        <strong>Sobre o Play Protect:</strong> em alguns Androids, o sistema pode mostrar um aviso porque o aplicativo foi instalado fora da Play Store. Toque em <strong>Mais detalhes</strong> e depois em <strong>Instalar assim mesmo</strong>, conferindo se o endereço é o oficial do Meu Caixa.
                    </div>
                </div>
                <button type="button" data-fechar-manual class="mt-6 w-full rounded-xl bg-gray-800 py-3 text-xs font-bold uppercase tracking-wider text-gray-200 hover:bg-gray-700">Fechar manual</button>
            </div>`;
        document.body.appendChild(modal);

        modal.querySelectorAll('[data-fechar-manual]').forEach(elemento => {
            elemento.addEventListener('click', fecharManual);
        });
        modal.addEventListener('click', evento => {
            if (evento.target === modal) fecharManual();
        });
    }

    function abrirManual() {
        const modal = document.getElementById('modal-manual');
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function fecharManual() {
        const modal = document.getElementById('modal-manual');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    window.abrirManual = abrirManual;
    window.fecharManual = fecharManual;
    document.addEventListener('DOMContentLoaded', criarManual);
})();
