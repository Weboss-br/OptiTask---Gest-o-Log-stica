// Script para gerenciar posições no Cadastro de Posições
document.addEventListener('DOMContentLoaded', () => {
    const positionsList = document.getElementById('positionsList');
    const positionForm = document.getElementById('positionForm');

    // Função para renderizar posições
    function renderPositions() {
        // Recuperar posições do localStorage
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        
        console.log('Posições recuperadas:', positions);

        // Limpar lista atual
        positionsList.innerHTML = '';

        // Renderizar cada posição
        positions.forEach(position => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${position.id}</td>
                <td>${position.type === 'picking' ? 'Picking' : 'Pulmão'}</td>
                <td>${position.totalCapacity}</td>
                <td>${position.occupiedPositions}</td>
                <td>
                    <div class="icon-actions">
                        <button class="edit-btn" data-id="${position.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" data-id="${position.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            positionsList.appendChild(row);
        });

        // Adicionar event listeners para editar e excluir
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editPosition);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deletePosition);
        });
    }

    // Função para adicionar nova posição
    function addPosition(event) {
        event.preventDefault();

        // Recuperar valores do formulário
        const id = document.getElementById('positionId').value;
        const type = document.getElementById('type').value;
        const totalCapacity = parseInt(document.getElementById('totalCapacity').value);
        const occupiedPositions = parseInt(document.getElementById('occupiedPositions').value);

        // Validar entrada
        if (!id || !type || isNaN(totalCapacity)) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        // Recuperar posições existentes
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');

        // Verificar se já existe uma posição com este ID
        const existingPosition = positions.find(p => p.id === id);

        if (existingPosition) {
            alert(`Já existe uma posição cadastrada com o ID ${id}. Por favor, escolha um ID diferente.`);
            return;
        }

        // Adicionar nova posição
        positions.push({
            id,
            type,
            totalCapacity,
            occupiedPositions: occupiedPositions || 0,
            availableSlots: totalCapacity - (occupiedPositions || 0)
        });

        // Salvar no localStorage
        localStorage.setItem('positions', JSON.stringify(positions));

        // Registrar atividade
        ActivityTracker.addActivity(`Posição ${id} adicionada`, ActivityTracker.types.POSICAO);

        // Renderizar posições
        renderPositions();

        // Limpar formulário
        positionForm.reset();
    }

    // Função para editar posição
    function editPosition(event) {
        const positionId = event.currentTarget.dataset.id;
        const positions = JSON.parse(localStorage.getItem('positions') || '[]');
        const position = positions.find(p => p.id === positionId);

        if (position) {
            // Preencher formulário com dados da posição
            document.getElementById('positionId').value = position.id;
            document.getElementById('type').value = position.type;
            document.getElementById('totalCapacity').value = position.totalCapacity;
            document.getElementById('occupiedPositions').value = position.occupiedPositions;
        }
    }

    // Função para excluir posição
    function deletePosition(event) {
        const positionId = event.currentTarget.dataset.id;
        const confirmDelete = confirm(`Tem certeza que deseja excluir a posição ${positionId}?`);

        if (confirmDelete) {
            const positions = JSON.parse(localStorage.getItem('positions') || '[]');
            const updatedPositions = positions.filter(p => p.id !== positionId);

            // Salvar no localStorage
            localStorage.setItem('positions', JSON.stringify(updatedPositions));

            // Registrar atividade
            ActivityTracker.addActivity(`Posição ${positionId} excluída`, ActivityTracker.types.POSICAO);

            // Renderizar posições
            renderPositions();
        }
    }

    // Função para popular dropdowns com itens configurados
    function populateConfigDropdowns() {
        const citySelect = document.getElementById('city');
        const moduleSelect = document.getElementById('module');
        const levelSelect = document.getElementById('level');
        const columnSelect = document.getElementById('column');

        // Limpar opções existentes
        [citySelect, moduleSelect, levelSelect, columnSelect].forEach(select => {
            select.innerHTML = `<option value="">Selecione ${select.id === 'city' ? 'a Cidade' : 
                select.id === 'module' ? 'um Módulo' : 
                select.id === 'level' ? 'um Nível' : 
                'uma Coluna'}</option>`;
        });

        // Recuperar itens do localStorage
        const cities = JSON.parse(localStorage.getItem('cities') || '[]');
        const modules = JSON.parse(localStorage.getItem('modules') || '[]');
        const levels = JSON.parse(localStorage.getItem('levels') || '[]');
        const columns = JSON.parse(localStorage.getItem('columns') || '[]');

        // Popular dropdowns
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.code;
            option.textContent = `${city.code} - ${city.description}`;
            citySelect.appendChild(option);
        });

        modules.forEach(module => {
            const option = document.createElement('option');
            option.value = module.code;
            option.textContent = `${module.code} - ${module.description}`;
            moduleSelect.appendChild(option);
        });

        levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level.code;
            option.textContent = `${level.code} - ${level.description}`;
            levelSelect.appendChild(option);
        });

        columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column.code;
            option.textContent = `${column.code} - ${column.description}`;
            columnSelect.appendChild(option);
        });
    }

    // Função para gerar ID de Posição automaticamente
    function generatePositionId() {
        const citySelect = document.getElementById('city');
        const moduleSelect = document.getElementById('module');
        const levelSelect = document.getElementById('level');
        const columnSelect = document.getElementById('column');
        const positionIdInput = document.getElementById('positionId');

        // Construir ID baseado nos códigos exatos dos itens selecionados
        let positionId = '';
        
        if (citySelect.value) {
            positionId += `${citySelect.value}-`;
        }
        
        if (moduleSelect.value) {
            positionId += `${moduleSelect.value}-`;
        }
        
        if (levelSelect.value) {
            positionId += `${levelSelect.value}-`;
        }
        
        if (columnSelect.value) {
            positionId += `${columnSelect.value}`;
        }

        // Atualizar campo de ID
        positionIdInput.value = positionId;
    }

    // Adicionar event listeners para atualização dinâmica do ID
    const citySelect = document.getElementById('city');
    const moduleSelect = document.getElementById('module');
    const levelSelect = document.getElementById('level');
    const columnSelect = document.getElementById('column');

    // Adicionar event listeners para cada select
    [citySelect, moduleSelect, levelSelect, columnSelect].forEach(select => {
        select.addEventListener('change', generatePositionId);
    });

    // Popular dropdowns e configurar geração de ID
    populateConfigDropdowns();

    // Adicionar event listener para o formulário
    positionForm.addEventListener('submit', addPosition);

    // Renderizar posições ao carregar a página
    renderPositions();
});
