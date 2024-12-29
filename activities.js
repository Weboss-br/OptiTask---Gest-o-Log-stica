// Utilitário de Gerenciamento de Atividades
const ActivityTracker = {
    // Método para adicionar uma nova atividade
    addActivity: function(description, type = 'sistema') {
        // Log de depuração
        console.log('Adicionando atividade:', { description, type });

        // Recuperar lista de atividades atual
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        
        // Criar novo objeto de atividade
        const newActivity = {
            id: `activity_${Date.now()}`,
            description: description,
            type: type,
            timestamp: new Date().toISOString()
        };

        // Adicionar nova atividade
        activities.push(newActivity);

        // Limitar o número de atividades (por exemplo, últimas 50)
        const limitedActivities = activities.slice(-50);

        // Salvar de volta no localStorage
        localStorage.setItem('activities', JSON.stringify(limitedActivities));

        // Log de depuração
        console.log('Atividades atualizadas:', limitedActivities);

        // Disparar evento para atualizar dashboard em tempo real
        window.dispatchEvent(new CustomEvent('activityAdded', { 
            detail: newActivity 
        }));
    },

    // Método para recuperar atividades
    getActivities: function(limit = 10) {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        const limitedActivities = activities.slice(-limit).reverse();
        
        // Log de depuração
        console.log('Recuperando atividades:', limitedActivities);
        
        return limitedActivities;
    },

    // Método para limpar atividades
    clearActivities: function() {
        // Log de depuração
        console.log('Limpando todas as atividades');
        
        localStorage.removeItem('activities');
    },

    // Tipos de atividades
    types: {
        SISTEMA: 'sistema',
        POSICAO: 'posicao',
        SKU: 'sku',
        CONFERENCIA: 'conferencia',
        TAREFA: 'tarefa'
    }
};

// Exportar para uso global
window.ActivityTracker = ActivityTracker;
