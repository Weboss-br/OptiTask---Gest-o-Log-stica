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
        'city': document.getElementById('city'),
        'module': document.getElementById('module'),
        'column': document.getElementById('column'),
        'level': document.getElementById('level')
    };

    const storageKeys = {
        'city': 'cities',
        'module': 'modules', 
        'column': 'columns',
        'level': 'levels'
    };

    Object.keys(dropdowns).forEach(key => {
        const dropdown = dropdowns[key];
        const storageKey = storageKeys[key];
        
        // Limpar opções existentes
        dropdown.innerHTML = `<option value="">Selecione uma ${key}</option>`;

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
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Criar objeto de posição
        const position = {
            city,
            module,
            level,
            column,
            positionId,
            type,
            totalCapacity: parseInt(totalCapacity),
            occupiedPositions: parseInt(occupiedPositions)
        };

        // Recuperar posições existentes
        let positions = JSON.parse(localStorage.getItem('positions') || '[]');

        // Verificar se já existe uma posição com o mesmo ID
        const existingPositionIndex = positions.findIndex(p => p.positionId === positionId);
        
        if (existingPositionIndex !== -1) {
            // Atualizar posição existente
            positions[existingPositionIndex] = position;
            alert('Posição atualizada com sucesso!');
        } else {
            // Adicionar nova posição
            positions.push(position);
            alert('Posição cadastrada com sucesso!');
        }

        // Salvar no localStorage
        localStorage.setItem('positions', JSON.stringify(positions));

        // Renderizar tabela de posições
        renderPositionsTable();

        // Limpar formulário
        positionForm.reset();
    }

    // Função para renderizar tabela de posições
    function renderPositionsTable() {
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        
        // Limpar tabela existente
        positionsTable.innerHTML = '';

        // Adicionar linhas à tabela
        positions.forEach((position, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${position.positionId}</td>
                <td>${position.type}</td>
                <td>${position.totalCapacity}</td>
                <td>${position.occupiedPositions}</td>
                <td>
                    <button onclick="editPosition(${index})">Editar</button>
                    <button onclick="deletePosition(${index})">Excluir</button>
                </td>
            `;
            positionsTable.appendChild(row);
        });
    }

    // Função para editar posição
    window.editPosition = function(index) {
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        const position = positions[index];

        // Preencher formulário com dados da posição
        document.getElementById('city').value = position.city;
        document.getElementById('module').value = position.module;
        document.getElementById('level').value = position.level;
        document.getElementById('column').value = position.column;
        document.getElementById('positionId').value = position.positionId;
        document.getElementById('type').value = position.type;
        document.getElementById('totalCapacity').value = position.totalCapacity;
        document.getElementById('occupiedPositions').value = position.occupiedPositions;
    }

    // Função para excluir posição
    window.deletePosition = function(index) {
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        
        // Confirmar exclusão
        if (confirm('Tem certeza que deseja excluir esta posição?')) {
            positions.splice(index, 1);
            localStorage.setItem('positions', JSON.stringify(positions));
            renderPositionsTable();
            alert('Posição excluída com sucesso!');
        }
    }

    // Adicionar event listener para o formulário
    positionForm.addEventListener('submit', addPosition);

    // Renderizar tabela ao carregar a página
    renderPositionsTable();
});