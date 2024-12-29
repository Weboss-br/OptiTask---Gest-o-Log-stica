document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Dashboard
    const totalPositionsEl = document.getElementById('totalPositions');
    const totalSkusEl = document.getElementById('totalSkus');
    const occupiedPositionsEl = document.getElementById('occupiedPositions');
    const pendingTasksEl = document.getElementById('pendingTasks');

    const pickingOccupationBar = document.getElementById('pickingOccupationBar');
    const pickingOccupationText = document.getElementById('pickingOccupationText');
    const pulmaoOccupationBar = document.getElementById('pulmaoOccupationBar');
    const pulmaoOccupationText = document.getElementById('pulmaoOccupationText');

    const recentActivitiesList = document.getElementById('recentActivitiesList');
    const pendingTasksBody = document.getElementById('pendingTasksBody');

    // Recuperar dados do localStorage
    const positions = JSON.parse(localStorage.getItem('positions') || '[]');
    const skus = JSON.parse(localStorage.getItem('skus') || '[]');
    const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
    
    // Usar ActivityTracker para recuperar atividades
    const activities = ActivityTracker.getActivities(5);

    // Log para verificar o conteúdo do localStorage
    console.log('Conteúdo do localStorage:', {
        positions: JSON.parse(localStorage.getItem('positions') || '[]'),
        skus: JSON.parse(localStorage.getItem('skus') || '[]'),
        todoList: JSON.parse(localStorage.getItem('todoList') || '[]')
    });

    // Métricas de Posições
    const totalPositions = positions.length;
    const pickingPositions = positions.filter(p => p.type === 'picking').length;
    const pulmaoPositions = positions.filter(p => p.type === 'pulmao').length;
    const occupiedPositions = positions.filter(p => p.occupiedPositions > 0).length;

    // Métricas de SKUs
    const totalSkus = skus.length;

    // Métricas de Tarefas
    const pendingTasks = todoList.filter(t => t.status === 'pending').length;

    // Atualizar métricas
    totalPositionsEl.textContent = totalPositions;
    totalSkusEl.textContent = totalSkus;
    occupiedPositionsEl.textContent = occupiedPositions;
    pendingTasksEl.textContent = pendingTasks;

    // Ocupação por tipo de posição
    const pickingOccupied = positions.filter(p => p.type === 'picking' && p.occupiedPositions > 0).length;
    const pulmaoOccupied = positions.filter(p => p.type === 'pulmao' && p.occupiedPositions > 0).length;

    pickingOccupationBar.style.width = `${(pickingOccupied / pickingPositions) * 100 || 0}%`;
    pickingOccupationText.textContent = `${pickingOccupied}/${pickingPositions}`;

    pulmaoOccupationBar.style.width = `${(pulmaoOccupied / pulmaoPositions) * 100 || 0}%`;
    pulmaoOccupationText.textContent = `${pulmaoOccupied}/${pulmaoPositions}`;

    // Atividades Recentes
    if (activities.length > 0) {
        recentActivitiesList.innerHTML = '';
        activities.forEach(activity => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="activity-description">${activity.description}</span>
                <span class="activity-timestamp">${new Date(activity.timestamp).toLocaleString()}</span>
            `;
            recentActivitiesList.appendChild(li);
        });
    } else {
        recentActivitiesList.innerHTML = '<li class="no-activities">Nenhuma atividade recente</li>';
    }

    // Tarefas Pendentes
    function updatePendingTasks() {
        console.log(' Iniciando updatePendingTasks()');
        
        // Recuperar lista de tarefas do localStorage
        const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
        
        console.log('Lista de tarefas recuperada:', todoList);
        console.log('Número total de tarefas:', todoList.length);
        
        // Filtrar tarefas pendentes
        const pendingTasks = todoList.filter(task => {
            console.log('Verificando tarefa:', task);
            console.log('Status da tarefa:', task.status);
            console.log('Tipo de status:', typeof task.status);
            return task.status === 'pending';
        });
        
        console.log('Tarefas pendentes:', pendingTasks);
        console.log('Número de tarefas pendentes:', pendingTasks.length);
        
        // Atualizar elemento de tarefas pendentes
        const pendingTasksElement = document.getElementById('pendingTasks');
        if (pendingTasksElement) {
            pendingTasksElement.textContent = pendingTasks.length;
            console.log(' Número de tarefas pendentes atualizado');
        } else {
            console.error(' Elemento pendingTasks não encontrado');
        }
        
        // Atualizar tabela de tarefas pendentes
        const pendingTasksBody = document.getElementById('pendingTasksBody');
        
        if (!pendingTasksBody) {
            console.error(' Elemento pendingTasksBody não encontrado');
            return;
        }
        
        console.log(' Preparando renderização de tarefas pendentes');
        
        // Limpar tabela anterior
        pendingTasksBody.innerHTML = '';
        
        // Adicionar tarefas pendentes à tabela
        if (pendingTasks.length > 0) {
            console.log(' Existem tarefas pendentes para renderizar');
            pendingTasks.forEach((task, index) => {
                console.log(`Detalhes da tarefa ${index + 1}:`, {
                    id: task.id,
                    fromPosition: task.fromPosition,
                    toPosition: task.toPosition,
                    skuCode: task.skuCode,
                    palletsToTransfer: task.palletsToTransfer,
                    status: task.status,
                    keys: Object.keys(task)
                });
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${task.fromPosition || 'N/A'}</td>
                    <td>${task.toPosition || 'N/A'}</td>
                    <td>${task.skuCode || 'N/A'}</td>
                    <td>${task.palletsToTransfer || 0} Pallets</td>
                `;
                pendingTasksBody.appendChild(tr);
                console.log(' Tarefa renderizada:', task.id);
                
                // Log do conteúdo da linha
                console.log('Conteúdo da linha:', tr.innerHTML);
            });
            
            // Log do conteúdo final da tabela
            console.log(' Conteúdo final da tabela:', pendingTasksBody.innerHTML);
        } else {
            console.log(' Nenhuma tarefa pendente para renderizar');
            // Se não houver tarefas pendentes, mostrar mensagem
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="4">Nenhuma tarefa pendente</td>`;
            pendingTasksBody.appendChild(tr);
        }
        
        console.log(' Fim de updatePendingTasks()');
    }

    updatePendingTasks();

    // Funções para manipular tarefas
    function startTask(taskId) {
        const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
        const updatedTodoList = todoList.map(task => 
            task.id === taskId ? {...task, status: 'in_progress'} : task
        );
        
        localStorage.setItem('todoList', JSON.stringify(updatedTodoList));
        
        // Adicionar atividade de rastreamento
        ActivityTracker.addActivity(
            `Tarefa ${taskId} iniciada`, 
            ActivityTracker.types.TAREFA
        );
        
        updatePendingTasks();
    }

    function cancelTask(taskId) {
        const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
        const updatedTodoList = todoList.map(task => 
            task.id === taskId ? {...task, status: 'cancelled'} : task
        );
        
        localStorage.setItem('todoList', JSON.stringify(updatedTodoList));
        
        // Adicionar atividade de rastreamento
        ActivityTracker.addActivity(
            `Tarefa ${taskId} cancelada`, 
            ActivityTracker.types.TAREFA
        );
        
        updatePendingTasks();
    }

    // Listener para novas atividades
    window.addEventListener('activityAdded', (event) => {
        const newActivity = event.detail;
        const firstChild = recentActivitiesList.firstChild;
        
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="activity-description">${newActivity.description}</span>
            <span class="activity-timestamp">${new Date(newActivity.timestamp).toLocaleString()}</span>
        `;

        // Adicionar no topo da lista
        if (firstChild) {
            recentActivitiesList.insertBefore(li, firstChild);
        } else {
            recentActivitiesList.appendChild(li);
        }

        // Remover classe de "sem atividades" se existir
        const noActivitiesEl = recentActivitiesList.querySelector('.no-activities');
        if (noActivitiesEl) {
            noActivitiesEl.remove();
        }
    });

    // Função para exportar dados
    function exportData() {
        // Coletar todos os dados importantes do localStorage
        const dataToExport = {
            positions: JSON.parse(localStorage.getItem('positions') || '[]'),
            skus: JSON.parse(localStorage.getItem('skus') || '[]'),
            tasks: JSON.parse(localStorage.getItem('todoList') || '[]')
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
                            // Atualizar localStorage
                            localStorage.setItem('positions', JSON.stringify(importedData.positions));
                            localStorage.setItem('skus', JSON.stringify(importedData.skus));
                            localStorage.setItem('todoList', JSON.stringify(importedData.tasks));
                            
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

    // Adicionar event listeners aos botões de navegação
    const exportButton = document.getElementById('exportData');
    const importButton = document.getElementById('importData');
    
    if (exportButton) {
        exportButton.addEventListener('click', exportData);
    }
    
    if (importButton) {
        importButton.addEventListener('click', importData);
    }
});

// Adicionar evento para limpar atividades
document.addEventListener('DOMContentLoaded', () => {
    const clearActivitiesBtn = document.getElementById('clearActivities');
    
    if (clearActivitiesBtn) {
        clearActivitiesBtn.addEventListener('click', () => {
            // Pedir confirmação antes de limpar
            const confirmClear = confirm('Tem certeza que deseja limpar todas as atividades recentes?');
            
            if (confirmClear) {
                // Limpar atividades
                ActivityTracker.clearActivities();
                
                // Atualizar lista de atividades
                updateRecentActivities();
                
                // Adicionar log da ação
                ActivityTracker.addActivity('Atividades recentes limpas', ActivityTracker.types.SISTEMA);
            }
        });
    }
});

// Função para carregar e atualizar métricas
function updateDashboardMetrics() {
    // Recuperar dados da conferência
    const positions = JSON.parse(localStorage.getItem('positions') || '[]');
    const skus = JSON.parse(localStorage.getItem('skus') || '[]');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

    console.log('Dados recuperados no Dashboard:', {
        positionsCount: positions.length,
        positions: positions
    });

    // Calcular métricas
    const totalPositions = positions.length;
    const totalSkus = skus.length;
    
    // Calcular posições ocupadas
    const occupiedPositions = positions.filter(pos => pos.occupiedPositions > 0).length;

    // Calcular total de pallets (soma de todos os occupiedPositions)
    const totalPallets = positions.reduce((sum, pos) => {
        if (pos.occupiedPositions && pos.occupiedPositions > 0) {
            console.log(`Posição: ${pos.id}, Pallets: ${pos.occupiedPositions}`);
            return sum + pos.occupiedPositions;
        }
        return sum;
    }, 0);

    const pendingTasks = tasks.filter(task => !task.completed).length;

    // Calcular posições vazias baseado na capacidade total
    const emptyPositions = positions.reduce((sum, pos) => {
        // Se a posição tem capacidade total definida e não está totalmente ocupada
        if (pos.totalCapacity && pos.occupiedPositions < pos.totalCapacity) {
            // Calcular quantas posições ainda estão vazias nesta localização
            const vacantSpaces = pos.totalCapacity - pos.occupiedPositions;
            console.log(`Posição: ${pos.id}, Capacidade Total: ${pos.totalCapacity}, Ocupadas: ${pos.occupiedPositions}, Vazias: ${vacantSpaces}`);
            return sum + vacantSpaces;
        }
        return sum;
    }, 0);

    // Calcular posições vazias por tipo
    const emptyPulmaoPositions = positions.reduce((sum, pos) => {
        // Verificar se é uma posição de Pulmão e tem espaços vazios
        if (pos.type === 'pulmao' && pos.totalCapacity && pos.occupiedPositions < pos.totalCapacity) {
            const vacantSpaces = pos.totalCapacity - pos.occupiedPositions;
            console.log(`Pulmão Vazio - Posição: ${pos.id}, Capacidade Total: ${pos.totalCapacity}, Ocupadas: ${pos.occupiedPositions}, Vazias: ${vacantSpaces}`);
            return sum + vacantSpaces;
        }
        return sum;
    }, 0);

    const emptyPickingPositions = positions.reduce((sum, pos) => {
        // Verificar se é uma posição de Picking e tem espaços vazios
        if (pos.type === 'picking' && pos.totalCapacity && pos.occupiedPositions < pos.totalCapacity) {
            const vacantSpaces = pos.totalCapacity - pos.occupiedPositions;
            console.log(`Picking Vazio - Posição: ${pos.id}, Capacidade Total: ${pos.totalCapacity}, Ocupadas: ${pos.occupiedPositions}, Vazias: ${vacantSpaces}`);
            return sum + vacantSpaces;
        }
        return sum;
    }, 0);

    // Atualizar elementos do Dashboard
    document.getElementById('totalPositions').textContent = totalPositions;
    document.getElementById('totalSkus').textContent = totalSkus;
    document.getElementById('occupiedPositions').textContent = occupiedPositions;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    document.getElementById('totalPallets').textContent = totalPallets;
    document.getElementById('emptyPositions').textContent = emptyPositions;
    document.getElementById('emptyPulmaoPositions').textContent = emptyPulmaoPositions;
    document.getElementById('emptyPickingPositions').textContent = emptyPickingPositions;

    console.log('Métricas finais no Dashboard:', {
        totalPositions,
        totalSkus,
        occupiedPositions,
        pendingTasks,
        totalPallets,
        emptyPositions,
        emptyPulmaoPositions,
        emptyPickingPositions
    });

    console.log('Posições Vazias:', {
        total: emptyPositions,
        pulmao: emptyPulmaoPositions,
        picking: emptyPickingPositions
    });

    // Atualizar barras de ocupação
    updateOccupationBars(positions);
}

// Função para atualizar barras de ocupação
function updateOccupationBars(positions) {
    // Filtrar posições de Picking e Pulmão
    const pickingPositions = positions.filter(pos => pos.type === 'picking');
    const pulmaoPositions = positions.filter(pos => pos.type === 'pulmao');

    // Calcular total de capacidade e posições ocupadas para Picking
    const pickingTotalCapacity = pickingPositions.reduce((sum, pos) => {
        return sum + (pos.totalCapacity || 0);
    }, 0);
    const pickingOccupiedPositions = pickingPositions.reduce((sum, pos) => {
        return sum + (pos.occupiedPositions || 0);
    }, 0);

    // Calcular total de capacidade e posições ocupadas para Pulmão
    const pulmaoTotalCapacity = pulmaoPositions.reduce((sum, pos) => {
        return sum + (pos.totalCapacity || 0);
    }, 0);
    const pulmaoOccupiedPositions = pulmaoPositions.reduce((sum, pos) => {
        return sum + (pos.occupiedPositions || 0);
    }, 0);

    // Calcular porcentagens de ocupação
    const pickingOccupationPercentage = pickingTotalCapacity > 0 
        ? (pickingOccupiedPositions / pickingTotalCapacity) * 100 
        : 0;
    const pulmaoOccupationPercentage = pulmaoTotalCapacity > 0 
        ? (pulmaoOccupiedPositions / pulmaoTotalCapacity) * 100 
        : 0;

    // Atualizar elementos visuais
    const pickingBar = document.getElementById('pickingOccupationBar');
    const pulmaoBar = document.getElementById('pulmaoOccupationBar');

    const pickingText = document.getElementById('pickingOccupationText');
    const pulmaoText = document.getElementById('pulmaoOccupationText');

    // Atualizar barras de progresso
    pickingBar.style.width = `${pickingOccupationPercentage}%`;
    pulmaoBar.style.width = `${pulmaoOccupationPercentage}%`;

    // Atualizar textos
    pickingText.textContent = `${pickingOccupiedPositions}/${pickingTotalCapacity}`;
    pulmaoText.textContent = `${pulmaoOccupiedPositions}/${pulmaoTotalCapacity}`;

    // Log para depuração
    console.log('Ocupação por Tipo de Posição:', {
        picking: {
            totalCapacity: pickingTotalCapacity,
            occupiedPositions: pickingOccupiedPositions,
            occupationPercentage: pickingOccupationPercentage
        },
        pulmao: {
            totalCapacity: pulmaoTotalCapacity,
            occupiedPositions: pulmaoOccupiedPositions,
            occupationPercentage: pulmaoOccupationPercentage
        }
    });
}

// Atualizar métricas quando a página carregar
document.addEventListener('DOMContentLoaded', updateDashboardMetrics);

// Atualizar métricas quando houver mudanças no localStorage
window.addEventListener('storage', updateDashboardMetrics);

// Função para atualizar métricas de tarefas pendentes
function updatePendingTasks() {
    console.log(' Iniciando updatePendingTasks()');
    
    // Recuperar lista de tarefas do localStorage
    const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
    
    console.log('Lista de tarefas recuperada:', todoList);
    console.log('Número total de tarefas:', todoList.length);
    
    // Filtrar tarefas pendentes
    const pendingTasks = todoList.filter(task => {
        console.log('Verificando tarefa:', task);
        console.log('Status da tarefa:', task.status);
        console.log('Tipo de status:', typeof task.status);
        return task.status === 'pending';
    });
    
    console.log('Tarefas pendentes:', pendingTasks);
    console.log('Número de tarefas pendentes:', pendingTasks.length);
    
    // Atualizar elemento de tarefas pendentes
    const pendingTasksElement = document.getElementById('pendingTasks');
    if (pendingTasksElement) {
        pendingTasksElement.textContent = pendingTasks.length;
        console.log(' Número de tarefas pendentes atualizado');
    } else {
        console.error(' Elemento pendingTasks não encontrado');
    }
    
    // Atualizar tabela de tarefas pendentes
    const pendingTasksBody = document.getElementById('pendingTasksBody');
    
    if (!pendingTasksBody) {
        console.error(' Elemento pendingTasksBody não encontrado');
        return;
    }
    
    console.log(' Preparando renderização de tarefas pendentes');
    
    // Limpar tabela anterior
    pendingTasksBody.innerHTML = '';
    
    // Adicionar tarefas pendentes à tabela
    if (pendingTasks.length > 0) {
        console.log(' Existem tarefas pendentes para renderizar');
        pendingTasks.forEach((task, index) => {
            console.log(`Detalhes da tarefa ${index + 1}:`, {
                id: task.id,
                fromPosition: task.fromPosition,
                toPosition: task.toPosition,
                skuCode: task.skuCode,
                palletsToTransfer: task.palletsToTransfer,
                status: task.status,
                keys: Object.keys(task)
            });
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${task.fromPosition || 'N/A'}</td>
                <td>${task.toPosition || 'N/A'}</td>
                <td>${task.skuCode || 'N/A'}</td>
                <td>${task.palletsToTransfer || 0} Pallets</td>
            `;
            pendingTasksBody.appendChild(tr);
            console.log(' Tarefa renderizada:', task.id);
            
            // Log do conteúdo da linha
            console.log('Conteúdo da linha:', tr.innerHTML);
        });
        
        // Log do conteúdo final da tabela
        console.log(' Conteúdo final da tabela:', pendingTasksBody.innerHTML);
    } else {
        console.log(' Nenhuma tarefa pendente para renderizar');
        // Se não houver tarefas pendentes, mostrar mensagem
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="4">Nenhuma tarefa pendente</td>`;
        pendingTasksBody.appendChild(tr);
    }
    
    console.log(' Fim de updatePendingTasks()');
}

// Adicionar função para concluir tarefa
function completeTask(taskId) {
    const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
    const updatedTodoList = todoList.map(task => 
        task.id === taskId ? {...task, status: 'completed'} : task
    );
    
    localStorage.setItem('todoList', JSON.stringify(updatedTodoList));
    updatePendingTasks();
}

// Adicionar listeners para atualizar tarefas
document.addEventListener('DOMContentLoaded', updatePendingTasks);
window.addEventListener('storage', updatePendingTasks);

// Função para renderizar atividades recentes
function updateRecentActivities() {
    // Recuperar lista de atividades
    const activities = ActivityTracker.getActivities(5); // Limitar para 5 atividades
    const recentActivitiesList = document.getElementById('recentActivitiesList');
    
    // Limpar lista anterior
    recentActivitiesList.innerHTML = '';
    
    // Verificar se há atividades
    if (activities.length === 0) {
        const noActivitiesLi = document.createElement('li');
        noActivitiesLi.classList.add('no-activities');
        noActivitiesLi.textContent = 'Nenhuma atividade recente';
        recentActivitiesList.appendChild(noActivitiesLi);
        return;
    }
    
    // Renderizar atividades
    activities.forEach(activity => {
        const li = document.createElement('li');
        
        // Definir ícone baseado no tipo de atividade
        let iconClass = 'fas fa-info-circle'; // ícone padrão
        switch(activity.type) {
            case ActivityTracker.types.SISTEMA:
                iconClass = 'fas fa-cogs';
                break;
            case ActivityTracker.types.POSICAO:
                iconClass = 'fas fa-map-marker-alt';
                break;
            case ActivityTracker.types.SKU:
                iconClass = 'fas fa-box';
                break;
            case ActivityTracker.types.CONFERENCIA:
                iconClass = 'fas fa-clipboard-check';
                break;
            case ActivityTracker.types.TAREFA:
                iconClass = 'fas fa-tasks';
                break;
        }
        
        // Formatar data
        const date = new Date(activity.timestamp);
        const formattedDate = date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Criar conteúdo da atividade
        li.innerHTML = `
            <div class="activity-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.description}</p>
                <span class="activity-time">${formattedDate}</span>
            </div>
        `;
        
        recentActivitiesList.appendChild(li);
    });
}

// Adicionar listeners para atualizar atividades
document.addEventListener('DOMContentLoaded', updateRecentActivities);
window.addEventListener('activityAdded', updateRecentActivities);
window.addEventListener('storage', updateRecentActivities);

// Função para adicionar cidade
function addCity(cityName) {
    // Recuperar lista de cidades
    const cities = JSON.parse(localStorage.getItem('cities') || '[]');
    
    // Verificar se a cidade já existe
    if (cities.includes(cityName)) {
        alert('Esta cidade já está cadastrada.');
        return;
    }
    
    // Adicionar nova cidade
    cities.push(cityName);
    
    // Salvar no localStorage
    localStorage.setItem('cities', JSON.stringify(cities));
    
    // Registrar atividade
    ActivityTracker.addActivity(`Nova cidade adicionada: ${cityName}`, ActivityTracker.types.SISTEMA);
    
    // Log de depuração
    console.log('Cidade adicionada:', cityName);
    console.log('Cidades atualizadas:', cities);
    
    // Atualizar métricas
    updateDashboardMetrics();
    
    return true;
}

// Função de debug para localStorage
function debugLocalStorage() {
    console.log('=== DEBUG LOCAL STORAGE ===');
    
    // Listar todas as chaves no localStorage
    console.log('Chaves no localStorage:', Object.keys(localStorage));
    
    // Itens específicos
    const items = [
        'todoList', 
        'positions', 
        'skus', 
        'activities'
    ];
    
    items.forEach(key => {
        try {
            const item = localStorage.getItem(key);
            console.log(`Conteúdo de ${key}:`, item ? JSON.parse(item) : 'Não encontrado');
        } catch (error) {
            console.error(`Erro ao parsear ${key}:`, error);
        }
    });
    
    console.log('=== FIM DEBUG LOCAL STORAGE ===');
}

// Chamar no carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    debugLocalStorage();
});
