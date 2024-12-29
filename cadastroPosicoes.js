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

        // Verificar se a posição já existe
        const existingPositionIndex = positions.findIndex(p => p.id === id);

        if (existingPositionIndex !== -1) {
            // Atualizar posição existente
            positions[existingPositionIndex] = {
                id,
                type,
                totalCapacity,
                occupiedPositions: occupiedPositions || 0,
                availableSlots: totalCapacity - (occupiedPositions || 0)
            };
        } else {
            // Adicionar nova posição
            positions.push({
                id,
                type,
                totalCapacity,
                occupiedPositions: occupiedPositions || 0,
                availableSlots: totalCapacity - (occupiedPositions || 0)
            });
        }

        // Salvar no localStorage
        localStorage.setItem('positions', JSON.stringify(positions));

        // Registrar atividade
        ActivityTracker.addActivity(`Posição ${id} ${existingPositionIndex !== -1 ? 'atualizada' : 'adicionada'}`, ActivityTracker.types.POSICAO);

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

    // Adicionar event listener para o formulário
    positionForm.addEventListener('submit', addPosition);

    // Renderizar posições ao carregar a página
    renderPositions();
});
