document.addEventListener('DOMContentLoaded', () => {
    const pickingPositionsList = document.getElementById('pickingPositionsList');
    const pulmaoPositionsList = document.getElementById('pulmaoPositionsList');
    const generateTodoListBtn = document.getElementById('generateTodoListBtn');

    // Função para salvar posições no localStorage
    function savePositionsToLocalStorage(positions) {
        console.log('Salvando posições no localStorage:', positions);
        localStorage.setItem('positions', JSON.stringify(positions));
        
        // Disparar evento de storage para atualizar outros documentos
        window.dispatchEvent(new Event('storage'));
    }

    // Função para renderizar tabela de Posições
    function renderPositionsTable() {
        // Log para depuração
        console.log('Iniciando renderização de posições');

        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        const skus = JSON.parse(localStorage.getItem('skus') || '[]');

        // Limpar tabelas existentes
        pickingPositionsList.innerHTML = '';
        pulmaoPositionsList.innerHTML = '';

        // Separar posições por tipo
        const pickingPositions = positions.filter(p => p.type === 'picking');
        const pulmaoPositions = positions.filter(p => p.type === 'pulmao');

        // Renderizar posições de Picking
        if (pickingPositions.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" style="text-align: center;">Nenhuma posição de Picking cadastrada</td>`;
            pickingPositionsList.appendChild(row);
        } else {
            pickingPositions.forEach((position, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${position.id}</td>
                    <td>${position.skuCode || ''}</td>
                    <td>${position.totalCapacity || 'Não definido'}</td>
                    <td>${position.occupiedPositions || 0}</td>
                    <td>
                        <button onclick="editPosition(${index}, 'picking')">Editar</button>
                        <button onclick="confirmPosition(${index}, 'picking')">Confirmar</button>
                    </td>
                `;
                pickingPositionsList.appendChild(row);
            });
        }

        // Renderizar posições de Pulmão
        if (pulmaoPositions.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" style="text-align: center;">Nenhuma posição de Pulmão cadastrada</td>`;
            pulmaoPositionsList.appendChild(row);
        } else {
            pulmaoPositions.forEach((position, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${position.id}</td>
                    <td>${position.skuCode || ''}</td>
                    <td>${position.totalCapacity || 'Não definido'}</td>
                    <td>${position.occupiedPositions || 0}</td>
                    <td>
                        <button onclick="editPosition(${index}, 'pulmao')">Editar</button>
                        <button onclick="confirmPosition(${index}, 'pulmao')">Confirmar</button>
                    </td>
                `;
                pulmaoPositionsList.appendChild(row);
            });
        }
    }

    // Função para editar Posição
    window.editPosition = function(index, type) {
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        const skus = JSON.parse(localStorage.getItem('skus') || '[]');
        const filteredPositions = positions.filter(p => p.type === type);
        const position = filteredPositions[index];

        // Criar modal de edição
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Editar Posição ${position.id}</h2>
                <form id="editPositionForm">
                    <div class="form-group">
                        <label for="editSkuCode">SKU</label>
                        <select id="editSkuCode" required>
                            <option value="">Selecione um SKU</option>
                            ${skus.map(sku => `
                                <option value="${sku.code}" ${sku.code === position.skuCode ? 'selected' : ''}>
                                    ${sku.code} - ${sku.description}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editOccupiedPositions">Posições Ocupadas</label>
                        <input type="number" id="editOccupiedPositions" 
                               value="${position.occupiedPositions || 0}" 
                               min="0" max="${position.totalCapacity}">
                    </div>
                    <div class="modal-actions">
                        <button type="button" onclick="closeModal()">Cancelar</button>
                        <button type="submit">Salvar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Adicionar evento de submit
        document.getElementById('editPositionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newSkuCode = document.getElementById('editSkuCode').value;
            const newOccupiedPositions = parseInt(document.getElementById('editOccupiedPositions').value);

            // Atualizar posição
            const positions = JSON.parse(localStorage.getItem('positions') || '[]');
            const positionIndex = positions.findIndex(p => 
                p.type === type && p.id === position.id
            );

            if (positionIndex !== -1) {
                positions[positionIndex] = {
                    ...positions[positionIndex],
                    skuCode: newSkuCode,
                    occupiedPositions: newOccupiedPositions
                };

                // Salvar no localStorage
                savePositionsToLocalStorage(positions);

                // Renderizar tabela atualizada
                renderPositionsTable();

                // Fechar modal
                closeModal();
            }
        });
    }

    // Função para fechar modal
    window.closeModal = function() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    }

    // Função para confirmar Posição
    window.confirmPosition = function(index, type) {
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        const filteredPositions = positions.filter(p => p.type === type);
        const position = filteredPositions[index];

        if (confirm(`Deseja confirmar a posição ${position.id}?`)) {
            // Lógica de confirmação (pode ser expandida no futuro)
            alert(`Posição ${position.id} confirmada com sucesso!`);
        }
    }

    // Função para popular posições iniciais
    function populateInitialPositions() {
        const existingPositions = JSON.parse(localStorage.getItem('positions') || '[]');
        
        if (existingPositions.length === 0) {
            // Criar algumas posições de exemplo
            const initialPositions = [
                { 
                    id: 'A1', 
                    type: 'picking',
                    skuCode: null, 
                    totalCapacity: 10, 
                    occupiedPositions: 0 
                },
                { 
                    id: 'A2', 
                    type: 'picking',
                    skuCode: null, 
                    totalCapacity: 15, 
                    occupiedPositions: 0 
                },
                { 
                    id: 'B1', 
                    type: 'pulmao',
                    skuCode: null, 
                    totalCapacity: 20, 
                    occupiedPositions: 0 
                }
            ];

            savePositionsToLocalStorage(initialPositions);
            console.log('Posições iniciais criadas:', initialPositions);
        } else {
            console.log('Posições já existentes:', existingPositions);
        }
    }

    // Função para gerar ToDo List
    function generateTodoList() {
        // Recuperar posições e SKUs
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        const skus = JSON.parse(localStorage.getItem('skus') || '[]');
        const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');

        // Filtrar posições de picking com espaço disponível
        const pickingPositions = positions.filter(p => 
            p.type === 'picking' && 
            p.skuCode && 
            p.occupiedPositions < p.totalCapacity
        );

        // Tarefas geradas
        const newTasks = [];

        // Verificar cada posição de picking
        pickingPositions.forEach(pickingPos => {
            // Calcular espaço disponível na posição de picking
            const availableSpace = pickingPos.totalCapacity - pickingPos.occupiedPositions;

            // Encontrar posições de pulmão com o mesmo SKU
            const pulmaoPositions = positions.filter(p => 
                p.type === 'pulmao' && 
                p.skuCode === pickingPos.skuCode &&
                p.occupiedPositions > 0
            );

            // Se encontrar posições de pulmão com o mesmo SKU
            if (pulmaoPositions.length > 0) {
                pulmaoPositions.forEach(pulmaoPos => {
                    // Encontrar informações do SKU
                    const skuInfo = skus.find(s => s.code === pickingPos.skuCode);
                    
                    // Calcular quantidade de pallets disponíveis para transferência
                    const palletsToTransfer = Math.min(
                        pulmaoPos.occupiedPositions,  // Pallets disponíveis no pulmão
                        availableSpace  // Espaço disponível na posição de picking
                    );

                    // Só criar tarefa se houver pallets para transferir
                    if (palletsToTransfer > 0) {
                        // Criar tarefa para transferência
                        const task = {
                            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            type: 'transfer',
                            fromPosition: pulmaoPos.id,
                            toPosition: pickingPos.id,
                            skuCode: pickingPos.skuCode,
                            skuDescription: skuInfo ? skuInfo.description : 'SKU não encontrado',
                            palletsToTransfer: palletsToTransfer,
                            status: 'pending'
                        };

                        createTask(task);
                        newTasks.push(task);
                    }
                });
            }
        });

        // Adicionar novas tarefas à lista existente
        const updatedTodoList = [...todoList, ...newTasks];

        // Salvar lista de tarefas atualizada
        localStorage.setItem('todoList', JSON.stringify(updatedTodoList));

        // Redirecionar para página de ToDo List
        window.location.href = 'todolist.html';
    }

    // Função para criar tarefa
    function createTask(task) {
        const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
        todoList.push(task);
        localStorage.setItem('todoList', JSON.stringify(todoList));

        // Registrar atividade
        ActivityTracker.addActivity(
            `Tarefa criada: Transferir ${task.palletsToTransfer} pallets de ${task.fromPosition} para ${task.toPosition}`, 
            ActivityTracker.types.TAREFA
        );
    }

    // Adicionar evento ao botão de gerar ToDo List
    generateTodoListBtn.addEventListener('click', generateTodoList);

    // Popular posições iniciais se necessário
    populateInitialPositions();

    // Renderizar tabela ao carregar a página
    renderPositionsTable();
});
