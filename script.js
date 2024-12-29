// Classe para representar posições de armazenamento
class StoragePosition {
    constructor(city, module, column, level, type, totalCapacity, occupiedPallets) {
        this.id = `${city}-${module}-${column}-${level}`;
        this.city = city;
        this.module = module;
        this.column = column;
        this.level = level;
        this.type = type; // 'picking' ou 'pulm'
        this.totalCapacity = totalCapacity;
        this.occupiedPallets = occupiedPallets;
        this.availableSlots = totalCapacity - occupiedPallets;
    }

    // Método para atualizar ocupação
    updateOccupation(palletCount) {
        if (palletCount >= 0 && palletCount <= this.totalCapacity) {
            this.occupiedPallets = palletCount;
            this.availableSlots = this.totalCapacity - palletCount;
            return true;
        }
        return false;
    }

    // Método para verificar se a posição precisa de reabastecimento
    needsRestocking() {
        return this.type === 'picking' && this.availableSlots > 0;
    }

    // Método para exportar dados em formato JSON
    toJSON() {
        return {
            id: this.id,
            city: this.city,
            module: this.module,
            column: this.column,
            level: this.level,
            type: this.type,
            totalCapacity: this.totalCapacity,
            occupiedPallets: this.occupiedPallets,
            availableSlots: this.availableSlots
        };
    }
}

// Classe para gerenciar o sistema de posições
class StorageManager {
    constructor() {
        this.positions = [];
    }

    // Método para adicionar nova posição
    addPosition(position) {
        this.positions.push(position);
    }

    // Método para encontrar posições que precisam de reabastecimento
    getRestockingTasks() {
        return this.positions
            .filter(pos => pos.needsRestocking())
            .map(pos => ({
                pickingPosition: pos,
                restockNeeded: pos.availableSlots
            }));
    }
}

// Inicialização do sistema
const storageManager = new StorageManager();

// Função para renderizar lista de posições
function renderPositionsList() {
    const container = document.getElementById('positionsContainer');
    container.innerHTML = ''; // Limpar lista anterior

    storageManager.positions.forEach(position => {
        const li = document.createElement('li');
        li.textContent = `${position.id} - Tipo: ${position.type} - Capacidade: ${position.totalCapacity} - Ocupados: ${position.occupiedPallets}`;
        container.appendChild(li);
    });
}

// Event listener para o formulário de cadastro
document.getElementById('positionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Capturar valores do formulário
    const city = document.getElementById('city').value;
    const module = document.getElementById('module').value;
    const column = document.getElementById('column').value;
    const level = document.getElementById('level').value;
    const type = document.getElementById('type').value;
    const totalCapacity = parseInt(document.getElementById('totalCapacity').value);
    const occupiedPallets = parseInt(document.getElementById('occupiedPallets').value);

    // Criar nova posição
    const newPosition = new StoragePosition(
        city, module, column, level, type, totalCapacity, occupiedPallets
    );
    
    // Adicionar posição ao gerenciador
    storageManager.addPosition(newPosition);

    // Renderizar lista atualizada
    renderPositionsList();

    // Limpar formulário
    this.reset();
});

// Função para popular dropdowns com dados do LocalStorage
function populateDropdowns() {
    const dropdowns = {
        'city': {
            element: document.getElementById('city'),
            defaultText: 'Selecione a Cidade'
        },
        'module': {
            element: document.getElementById('module'),
            defaultText: 'Selecione um Módulo'
        },
        'column': {
            element: document.getElementById('column'),
            defaultText: 'Selecione uma Coluna'
        },
        'level': {
            element: document.getElementById('level'),
            defaultText: 'Selecione um Nível'
        }
    };

    const storageKeys = {
        'city': 'cities',
        'module': 'modules', 
        'column': 'columns',
        'level': 'levels'
    };

    Object.keys(dropdowns).forEach(key => {
        const dropdown = dropdowns[key].element;
        const storageKey = storageKeys[key];
        
        // Limpar opções existentes
        dropdown.innerHTML = `<option value="">${dropdowns[key].defaultText}</option>`;

        // Recuperar itens do LocalStorage
        const savedItems = localStorage.getItem(storageKey);
        if (savedItems) {
            const items = JSON.parse(savedItems);
            
            // Adicionar opções
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.code;
                option.textContent = `${item.code} - ${item.description}`;
                dropdown.appendChild(option);
            });
        }
    });
}

// Chamar ao carregar a página
window.addEventListener('load', populateDropdowns);

document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('city');
    const moduleSelect = document.getElementById('module');
    const levelSelect = document.getElementById('level');
    const columnSelect = document.getElementById('column');
    const positionIdInput = document.getElementById('positionId');

    function updatePositionId() {
        const cityCode = citySelect.value ? `${citySelect.value}-` : '';
        const moduleCode = moduleSelect.value ? `${moduleSelect.value}-` : '';
        const levelCode = levelSelect.value ? `${levelSelect.value}-` : '';
        const columnCode = columnSelect.value ? columnSelect.value : '';

        positionIdInput.value = `${cityCode}${moduleCode}${levelCode}${columnCode}`;
    }

    citySelect.addEventListener('change', updatePositionId);
    moduleSelect.addEventListener('change', updatePositionId);
    levelSelect.addEventListener('change', updatePositionId);
    columnSelect.addEventListener('change', updatePositionId);
});

document.addEventListener('DOMContentLoaded', () => {
    const positionForm = document.getElementById('positionForm');
    const positionsTable = document.getElementById('positionsList');

    // Função para adicionar posição
    function addPosition(event) {
        event.preventDefault();

        // Capturar valores dos campos
        const city = document.getElementById('city').value;
        const module = document.getElementById('module').value;
        const level = document.getElementById('level').value;
        const column = document.getElementById('column').value;
        const positionId = document.getElementById('positionId').value;
        const type = document.getElementById('type').value;
        const totalCapacity = document.getElementById('totalCapacity').value;
        const occupiedPositions = document.getElementById('occupiedPositions').value || '0';

        // Validar campos obrigatórios
        if (!city || !module || !level || !column || !positionId || !type || !totalCapacity) {
            // Removido alert
            return;
        }

        // Recuperar posições existentes do localStorage
        let positions = JSON.parse(localStorage.getItem('positions') || '[]');

        // Verificar se a posição já existe
        const positionExists = positions.some(pos => pos.id === positionId);
        
        if (positionExists) {
            // Removido alert
            return;
        }

        // Criar objeto de posição
        const position = {
            id: positionId,
            city,
            module,
            level,
            column,
            type,
            totalCapacity: parseInt(totalCapacity),
            occupiedPositions: parseInt(occupiedPositions),
            availableSlots: parseInt(totalCapacity) - parseInt(occupiedPositions)
        };

        // Adicionar nova posição ao array
        positions.push(position);

        // Salvar no localStorage
        localStorage.setItem('positions', JSON.stringify(positions));

        // Renderizar tabela atualizada
        renderPositionsTable();

        // Limpar formulário
        positionForm.reset();

        // Removido alert
    }

    // Função para renderizar tabela de posições com edição controlada
    function renderPositionsTable() {
        const positionsList = document.getElementById('positionsList');
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        
        // Limpar tabela existente
        positionsList.innerHTML = '';

        positions.forEach((position, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${position.id}</td>
                <td>
                    <span class="display-type" data-index="${index}">${position.type === 'picking' ? 'Picking' : 'Pulmão'}</span>
                    <select class="edit-type" data-index="${index}" style="display:none;">
                        <option value="picking" ${position.type === 'picking' ? 'selected' : ''}>Picking</option>
                        <option value="pulmao" ${position.type === 'pulmao' ? 'selected' : ''}>Pulmão</option>
                    </select>
                </td>
                <td>
                    <span class="display-capacity" data-index="${index}">${position.totalCapacity}</span>
                    <input type="number" class="edit-capacity" value="${position.totalCapacity}" 
                           data-index="${index}" min="0" style="display:none;">
                </td>
                <td>
                    <span class="display-occupied" data-index="${index}">${position.occupiedPositions}</span>
                    <input type="number" class="edit-occupied" value="${position.occupiedPositions}" 
                           data-index="${index}" min="0" max="${position.totalCapacity}" style="display:none;">
                </td>
                <td>
                    <button class="btn-edit" data-index="${index}">Editar</button>
                    <button class="btn-save-edit" data-index="${index}" style="display:none;">Salvar</button>
                    <button class="btn-delete" data-index="${index}">Excluir</button>
                </td>
            `;
            positionsList.appendChild(row);
        });

        // Adicionar event listeners para edição
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                
                // Mostrar campos de edição
                const editableFields = [
                    { display: `.display-type[data-index="${index}"]`, edit: `.edit-type[data-index="${index}"]` },
                    { display: `.display-capacity[data-index="${index}"]`, edit: `.edit-capacity[data-index="${index}"]` },
                    { display: `.display-occupied[data-index="${index}"]`, edit: `.edit-occupied[data-index="${index}"]` }
                ];

                editableFields.forEach(field => {
                    const displayElement = document.querySelector(field.display);
                    const editElement = document.querySelector(field.edit);
                    
                    displayElement.style.display = 'none';
                    editElement.style.display = 'block';
                });
                
                // Mostrar botão Salvar, esconder Editar
                this.style.display = 'none';
                document.querySelector(`.btn-save-edit[data-index="${index}"]`).style.display = 'inline-block';
            });
        });

        // Adicionar event listeners para salvar
        document.querySelectorAll('.btn-save-edit').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                const typeSelect = document.querySelector(`.edit-type[data-index="${index}"]`);
                const capacityInput = document.querySelector(`.edit-capacity[data-index="${index}"]`);
                const occupiedInput = document.querySelector(`.edit-occupied[data-index="${index}"]`);

                // Recuperar posições do localStorage
                let positions = JSON.parse(localStorage.getItem('positions') || '[]');

                // Validar capacidade e ocupação
                const totalCapacity = parseInt(capacityInput.value);
                const occupiedPositions = parseInt(occupiedInput.value);

                if (occupiedPositions > totalCapacity) {
                    // Removido alert
                    return;
                }

                // Atualizar posição
                positions[index].type = typeSelect.value;
                positions[index].totalCapacity = totalCapacity;
                positions[index].occupiedPositions = occupiedPositions;
                positions[index].availableSlots = totalCapacity - occupiedPositions;

                // Salvar no localStorage
                localStorage.setItem('positions', JSON.stringify(positions));

                // Atualizar spans de exibição
                document.querySelector(`.display-type[data-index="${index}"]`).textContent = 
                    typeSelect.value === 'picking' ? 'Picking' : 'Pulmão';
                document.querySelector(`.display-capacity[data-index="${index}"]`).textContent = totalCapacity;
                document.querySelector(`.display-occupied[data-index="${index}"]`).textContent = occupiedPositions;

                // Esconder campos de edição
                const editableFields = [
                    { display: `.display-type[data-index="${index}"]`, edit: `.edit-type[data-index="${index}"]` },
                    { display: `.display-capacity[data-index="${index}"]`, edit: `.edit-capacity[data-index="${index}"]` },
                    { display: `.display-occupied[data-index="${index}"]`, edit: `.edit-occupied[data-index="${index}"]` }
                ];

                editableFields.forEach(field => {
                    const displayElement = document.querySelector(field.display);
                    const editElement = document.querySelector(field.edit);
                    
                    editElement.style.display = 'none';
                    displayElement.style.display = 'block';
                });

                // Mostrar botão Editar, esconder Salvar
                this.style.display = 'none';
                document.querySelector(`.btn-edit[data-index="${index}"]`).style.display = 'inline-block';

                // Removido alert
            });
        });

        // Adicionar event listeners para exclusão
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                
                // Confirmar exclusão
                if (confirm('Tem certeza que deseja excluir esta posição?')) {
                    // Recuperar posições do localStorage
                    let positions = JSON.parse(localStorage.getItem('positions') || '[]');

                    // Remover posição
                    positions.splice(index, 1);

                    // Salvar no localStorage
                    localStorage.setItem('positions', JSON.stringify(positions));

                    // Rerenderizar tabela
                    renderPositionsTable();

                    // Removido alert
                }
            });
        });
    }

    // Substituir função de edição anterior
    function editPosition(index) {
        // Agora a edição é feita inline na tabela
        renderPositionsTable();
    }

    // Função para excluir posição
    window.deletePosition = function(index) {
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        
        // Confirmar exclusão
        if (confirm('Tem certeza que deseja excluir esta posição?')) {
            positions.splice(index, 1);
            localStorage.setItem('positions', JSON.stringify(positions));
            renderPositionsTable();
            // Removido alert
        }
    }

    // Adicionar event listener para o formulário
    positionForm.addEventListener('submit', addPosition);

    // Renderizar tabela ao carregar a página
    renderPositionsTable();
});

// Função para atualizar as métricas
function updateMetrics() {
    // Recuperar dados do localStorage
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
    
    // Calcular posições ocupadas e total de pallets
    const occupiedPositions = positions.filter(pos => pos.occupied).length;
    const totalPallets = positions.reduce((sum, pos) => {
        // Se a posição estiver ocupada, adicionar o número de pallets
        if (pos.occupied && pos.occupiedPositions > 0) {
            console.log(`Posição ocupada: ${pos.id}, Pallets: ${pos.occupiedPositions}`);
            return sum + pos.occupiedPositions;
        }
        return sum;
    }, 0);

    const pendingTasks = tasks.filter(task => !task.completed).length;
    const emptyPositions = totalPositions - occupiedPositions;

    // Atualizar os elementos na página
    document.getElementById('totalPositions').textContent = totalPositions;
    document.getElementById('totalSkus').textContent = totalSkus;
    document.getElementById('occupiedPositions').textContent = occupiedPositions;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    document.getElementById('totalPallets').textContent = totalPallets;
    document.getElementById('emptyPositions').textContent = emptyPositions;

    console.log('Métricas finais no Dashboard:', {
        totalPositions,
        totalSkus,
        occupiedPositions,
        pendingTasks,
        totalPallets,
        emptyPositions
    });
}

// Adicionar listeners para garantir atualização
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard carregado - Atualizando métricas');
    updateMetrics();
});

window.addEventListener('storage', (event) => {
    console.log('Evento de storage disparado no Dashboard:', event);
    updateMetrics();
});

// Função de debug para verificar o localStorage
function debugLocalStorage() {
    const keys = ['positions', 'skus', 'tasks'];
    keys.forEach(key => {
        console.log(`Conteúdo de ${key}:`, localStorage.getItem(key));
    });
}

// Chamar debug no carregamento
debugLocalStorage();

// Função para salvar a conferência de posição
function savePositionCheck() {
    const position = document.getElementById('checkPosition').value;
    const quantity = document.getElementById('checkQuantity').value;
    const date = new Date().toISOString();

    if (!position || !quantity) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Atualizar a contagem de pallets
    updatePositionCheck(position, quantity);

    // Atualizar a tabela de conferências
    const checks = JSON.parse(localStorage.getItem('checks') || '[]');
    checks.push({ position, quantity, date });
    localStorage.setItem('checks', JSON.stringify(checks));

    // Limpar formulário
    document.getElementById('checkPosition').value = '';
    document.getElementById('checkQuantity').value = '';

    // Atualizar a tabela
    updateChecksTable();
    
    // Atualizar métricas
    updateMetrics();
}