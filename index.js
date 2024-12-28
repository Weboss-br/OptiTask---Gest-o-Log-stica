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
    if (pendingTasks > 0) {
        pendingTasksBody.innerHTML = '';
        todoList.filter(t => t.status === 'pending').forEach(task => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${task.fromPosition}</td>
                <td>${task.skuCode}</td>
                <td>${task.palletsToTransfer} Pallets</td>
                <td>Pendente</td>
                <td>
                    <button class="btn-action">Detalhes</button>
                    <button class="btn-action">Iniciar</button>
                </td>
            `;
            pendingTasksBody.appendChild(tr);
        });
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

    // Botões de exportar e importar
    const exportButton = document.querySelector('.btn-export');
    const importButton = document.querySelector('.btn-import');

    // Função para exportar dados
    function exportData() {
        // Coletar dados do localStorage
        const dataToExport = {
            positions: JSON.parse(localStorage.getItem('positions') || '[]'),
            skus: JSON.parse(localStorage.getItem('skus') || '[]'),
            tasks: JSON.parse(localStorage.getItem('todoList') || '[]'),
            activities: JSON.parse(localStorage.getItem('activities') || '[]')
        };

        // Converter para JSON
        const jsonData = JSON.stringify(dataToExport, null, 2);

        // Criar um blob para download
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Criar link de download
        const a = document.createElement('a');
        a.href = url;
        a.download = `optitask_export_${new Date().toISOString().replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Mostrar notificação
        alert('Dados exportados com sucesso!');
    }

    // Função para importar dados
    function importData() {
        // Criar input de arquivo
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

                        // Validar estrutura dos dados
                        if (importedData.positions && importedData.skus && 
                            importedData.tasks && importedData.activities) {
                            
                            // Atualizar localStorage
                            localStorage.setItem('positions', JSON.stringify(importedData.positions));
                            localStorage.setItem('skus', JSON.stringify(importedData.skus));
                            localStorage.setItem('todoList', JSON.stringify(importedData.tasks));
                            localStorage.setItem('activities', JSON.stringify(importedData.activities));

                            // Recarregar página para atualizar dashboard
                            alert('Dados importados com sucesso! A página será recarregada.');
                            location.reload();
                        } else {
                            alert('Formato de arquivo inválido. Certifique-se de usar um arquivo exportado pelo OptiTask.');
                        }
                    } catch (error) {
                        alert('Erro ao importar dados. Verifique o arquivo.');
                        console.error(error);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    // Adicionar event listeners
    if (exportButton) {
        exportButton.addEventListener('click', exportData);
    }

    if (importButton) {
        importButton.addEventListener('click', importData);
    }
});
