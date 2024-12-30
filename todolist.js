document.addEventListener('DOMContentLoaded', () => {
    const todoListBody = document.getElementById('todoListBody');

    // Função para formatar data e hora
    function formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Função para formatar ID reduzido
    function formatShortId(id) {
        // Pegar os últimos 6 caracteres do ID
        return id.slice(-6);
    }

    // Função para renderizar lista de tarefas
    function renderTodoList() {
        // Recuperar lista de tarefas do localStorage
        const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');

        // Ordenar tarefas: pendentes primeiro, depois por timestamp
        const sortedTodoList = todoList.sort((a, b) => {
            // Pendentes primeiro
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (b.status === 'pending' && a.status !== 'pending') return 1;
            
            // Se ambos tiverem o mesmo status, ordenar por timestamp
            return parseInt(b.id.split('_')[1]) - parseInt(a.id.split('_')[1]);
        });

        // Limpar tabela existente
        todoListBody.innerHTML = '';

        // Se não houver tarefas
        if (sortedTodoList.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="9" style="text-align: center;">Nenhuma tarefa encontrada</td>`;
            todoListBody.appendChild(row);
            return;
        }

        // Renderizar cada tarefa
        sortedTodoList.forEach((task, index) => {
            // Extrair timestamp do ID
            const timestamp = task.id.split('_')[1];
            const formattedDateTime = formatDateTime(parseInt(timestamp));

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatShortId(task.id)}</td>
                <td>${formattedDateTime}</td>
                <td>${task.fromPosition}</td>
                <td>${task.toPosition}</td>
                <td>${task.skuCode}</td>
                <td>${task.skuDescription || 'Não definido'}</td>
                <td>${task.palletsToTransfer || 0} Pallets</td>
                <td>
                    <span class="task-status ${task.status}">
                        ${task.status === 'pending' ? 'Pendente' : 'Concluído'}
                    </span>
                </td>
                <td>
                    ${task.status === 'pending' 
                        ? `<button onclick="completeTask('${task.id}')">Concluir</button>` 
                        : `<button class="btn-reopen" onclick="reopenTask('${task.id}')">Reabrir</button>`}
                </td>
            `;
            todoListBody.appendChild(row);
        });
    }

    // Função para concluir tarefa
    window.completeTask = function(taskId) {
        const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        
        // Encontrar a tarefa
        const taskIndex = todoList.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            const task = todoList[taskIndex];
            
            // Atualizar posições de origem e destino
            const fromPositionIndex = positions.findIndex(p => p.positionId === task.fromPosition);
            const toPositionIndex = positions.findIndex(p => p.positionId === task.toPosition);
            
            if (fromPositionIndex !== -1 && toPositionIndex !== -1) {
                // Reduzir pallets na posição de origem
                positions[fromPositionIndex].occupiedPositions -= task.palletsToTransfer;
                
                // Aumentar pallets na posição de destino
                positions[toPositionIndex].occupiedPositions += task.palletsToTransfer;
                
                // Salvar posições atualizadas
                localStorage.setItem('positions', JSON.stringify(positions));
            }
            
            // Atualizar status da tarefa
            todoList[taskIndex].status = 'completed';
            
            // Salvar lista de tarefas atualizada
            localStorage.setItem('todoList', JSON.stringify(todoList));

            // Renderizar lista atualizada
            renderTodoList();
        }
    }

    // Função para reabrir tarefa
    window.reopenTask = function(taskId) {
        const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        
        // Encontrar a tarefa
        const taskIndex = todoList.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            const task = todoList[taskIndex];
            
            // Atualizar posições de origem e destino
            const fromPositionIndex = positions.findIndex(p => p.positionId === task.fromPosition);
            const toPositionIndex = positions.findIndex(p => p.positionId === task.toPosition);
            
            if (fromPositionIndex !== -1 && toPositionIndex !== -1) {
                // Reverter transferência de pallets
                positions[fromPositionIndex].occupiedPositions += task.palletsToTransfer;
                positions[toPositionIndex].occupiedPositions -= task.palletsToTransfer;
                
                // Salvar posições atualizadas
                localStorage.setItem('positions', JSON.stringify(positions));
            }
            
            // Atualizar status da tarefa
            todoList[taskIndex].status = 'pending';
            
            // Salvar lista de tarefas atualizada
            localStorage.setItem('todoList', JSON.stringify(todoList));

            // Renderizar lista atualizada
            renderTodoList();
        }
    }

    // Função para exportar dados
    function exportData() {
        // Coletar todos os dados importantes do localStorage
        const dataToExport = {
            positions: JSON.parse(localStorage.getItem('positions') || '[]'),
            skus: JSON.parse(localStorage.getItem('skus') || '[]'),
            tasks: JSON.parse(localStorage.getItem('todoList') || '[]'),
            // Adicionar dados de configuração
            cidades: JSON.parse(localStorage.getItem('cities') || '[]'),
            modulos: JSON.parse(localStorage.getItem('modules') || '[]'),
            niveis: JSON.parse(localStorage.getItem('levels') || '[]'),
            colunas: JSON.parse(localStorage.getItem('columns') || '[]'),
            categorias: JSON.parse(localStorage.getItem('categories') || '[]')
        };

        // Criar blob com os dados
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        
        // Criar link de download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `optitask_export_${new Date().toISOString().replace(/:/g, '-')}.json`;
        
        // Disparar download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Função para importar dados
    function importData() {
        // Criar input para arquivo
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        
                        console.log('Dados importados:', importedData);
                        
                        // Validar estrutura dos dados
                        if (importedData.positions && importedData.skus && importedData.tasks) {
                            // Atualizar localStorage com dados importados
                            localStorage.setItem('positions', JSON.stringify(importedData.positions));
                            localStorage.setItem('skus', JSON.stringify(importedData.skus));
                            localStorage.setItem('todoList', JSON.stringify(importedData.tasks));
                            
                            // Importar dados de configuração
                            localStorage.setItem('cities', JSON.stringify(importedData.cidades || []));
                            localStorage.setItem('modules', JSON.stringify(importedData.modulos || []));
                            localStorage.setItem('levels', JSON.stringify(importedData.niveis || []));
                            localStorage.setItem('columns', JSON.stringify(importedData.colunas || []));
                            localStorage.setItem('categories', JSON.stringify(importedData.categorias || []));
                            
                            console.log('Dados salvos no localStorage');
                            
                            // Adicionar log de atividade
                            ActivityTracker.addActivity('Dados importados com sucesso', ActivityTracker.types.SISTEMA);
                            
                            // Recarregar página para refletir mudanças
                            window.location.reload();
                        } else {
                            console.error('Estrutura de dados inválida:', importedData);
                            alert('Formato de arquivo inválido. Verifique o console para mais detalhes.');
                        }
                    } catch (error) {
                        console.error('Erro ao importar arquivo:', error);
                        alert('Erro ao importar arquivo: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        
        // Disparar seleção de arquivo
        input.click();
    }

    // Adicionar event listeners para exportação e importação
    const exportButton = document.getElementById('exportData');
    const importButton = document.getElementById('importData');
    
    if (exportButton) {
        exportButton.addEventListener('click', exportData);
    }
    
    if (importButton) {
        importButton.addEventListener('click', importData);
    }

    // Renderizar lista ao carregar a página
    renderTodoList();
});
