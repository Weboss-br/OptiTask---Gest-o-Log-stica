// Função centralizada para exportar dados
export function exportData(additionalData = {}) {
    console.log('📤 Exportando dados...');
    
    // Carregar dados existentes do localStorage, se houver
    const existingDataStr = localStorage.getItem('exportedConfigurations');
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};

    // Dados atuais a serem exportados
    const currentData = {
        cidades: JSON.parse(localStorage.getItem('cities') || '[]'),
        modulos: JSON.parse(localStorage.getItem('modules') || '[]'),
        niveis: JSON.parse(localStorage.getItem('levels') || '[]'),
        colunas: JSON.parse(localStorage.getItem('columns') || '[]'),
        categorias: JSON.parse(localStorage.getItem('categories') || '[]'),
        skus: JSON.parse(localStorage.getItem('skus') || '[]'),
        positions: JSON.parse(localStorage.getItem('positions') || '[]'),
        tasks: JSON.parse(localStorage.getItem('todoList') || '[]'),
        ...additionalData
    };

    // Mesclar dados existentes com dados atuais, priorizando dados atuais
    const mergedData = {};
    Object.keys(currentData).forEach(key => {
        mergedData[key] = [
            ...(existingData[key] || []), 
            ...currentData[key]
        ];
    });

    // Remover itens duplicados baseado no código ou id
    const uniqueData = {};
    Object.keys(mergedData).forEach(key => {
        if (key === 'positions' || key === 'tasks') {
            // Para positions e tasks, usar o id como chave de unicidade
            uniqueData[key] = Array.from(
                new Map(mergedData[key].map(item => [item.id, item])).values()
            );
        } else {
            // Para outras categorias, usar o código
            uniqueData[key] = Array.from(
                new Map(mergedData[key].map(item => [item.code, item])).values()
            );
        }
    });

    // Salvar dados mesclados no localStorage para futuras exportações
    localStorage.setItem('exportedConfigurations', JSON.stringify(uniqueData));

    // Criar Blob para download
    const blob = new Blob([JSON.stringify(uniqueData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optitask_export_${new Date().toISOString().replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Dados exportados com sucesso!');
    return uniqueData;
}

// Função para importar dados
export function importData(jsonData) {
    try {
        // Verificar se os dados são válidos
        if (!jsonData || typeof jsonData !== 'object') {
            throw new Error('Dados inválidos para importação');
        }

        // Mapeamento de chaves para localStorage
        const keyMap = {
            'cidades': 'cities',
            'modulos': 'modules',
            'niveis': 'levels',
            'colunas': 'columns',
            'categorias': 'categories',
            'skus': 'skus',
            'positions': 'positions',
            'tasks': 'todoList'
        };

        // Importar cada categoria
        Object.keys(keyMap).forEach(originalKey => {
            const storageKey = keyMap[originalKey];
            
            // Verificar se a categoria existe nos dados importados
            if (jsonData[originalKey] && Array.isArray(jsonData[originalKey])) {
                // Recuperar dados existentes
                const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');

                // Função para verificar duplicatas
                const isDuplicate = (existingItem, newItem) => {
                    // Para posições e tarefas, usar id
                    if (originalKey === 'positions' || originalKey === 'tasks') {
                        return existingItem.id === newItem.id;
                    }
                    // Para outras categorias, usar código
                    return existingItem.code === newItem.code;
                };

                // Mesclar dados, removendo duplicatas
                const mergedData = [...existingData];
                jsonData[originalKey].forEach(item => {
                    const duplicate = mergedData.some(existingItem => 
                        isDuplicate(existingItem, item)
                    );
                    
                    if (!duplicate) {
                        mergedData.push(item);
                    }
                });

                // Salvar dados mesclados
                localStorage.setItem(storageKey, JSON.stringify(mergedData));

                console.log(`✅ Importados ${mergedData.length} itens para ${storageKey}`);
            }
        });

        // Disparar evento para notificar que os dados foram importados
        const event = new CustomEvent('dataImported', { 
            detail: { 
                importedData: jsonData 
            } 
        });
        window.dispatchEvent(event);

        return true;
    } catch (error) {
        console.error('❌ Erro ao importar dados:', error);
        
        // Disparar evento de erro
        const event = new CustomEvent('dataImportError', { 
            detail: { 
                error: error.message 
            } 
        });
        window.dispatchEvent(event);

        return false;
    }
}
