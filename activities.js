// Utilitário de Gerenciamento de Atividades
const ActivityTracker = {
    // Método para adicionar uma nova atividade
    addActivity: function(description, type = 'sistema') {
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

        // Disparar evento para atualizar dashboard em tempo real
        window.dispatchEvent(new CustomEvent('activityAdded', { 
            detail: newActivity 
        }));
    },

    // Método para recuperar atividades
    getActivities: function(limit = 10) {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        return activities.slice(-limit).reverse();
    },

    // Método para limpar atividades
    clearActivities: function() {
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
