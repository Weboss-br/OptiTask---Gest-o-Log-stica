// Classe base para itens configuráveis
class ConfigurableItem {
    constructor(code, description) {
        this.code = code;
        this.description = description;
        this.id = `${code}_${Date.now()}`; // Adicionar ID único
    }

    toJSON() {
        return {
            code: this.code,
            description: this.description,
            id: this.id
        };
    }

    toString() {
        return `${this.code} - ${this.description}`;
    }
}

// Gerenciador de configurações
class ConfigManager {
    constructor(storageKey, listId) {
        this.storageKey = storageKey;
        this.listId = listId;
        this.items = this.loadFromLocalStorage();
    }

    // Carregar itens do LocalStorage
    loadFromLocalStorage() {
        const savedItems = localStorage.getItem(this.storageKey);
        return savedItems ? JSON.parse(savedItems).map(item => 
            new ConfigurableItem(item.code, item.description)
        ) : [];
    }

    // Salvar itens no LocalStorage
    saveToLocalStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    }

    // Adicionar novo item
    addItem(item) {
        // Verificar se já existe um item com o mesmo código
        const existingItemIndex = this.items.findIndex(i => i.code === item.code);
        
        if (existingItemIndex !== -1) {
            // Atualizar item existente
            this.items[existingItemIndex] = item;
        } else {
            // Adicionar novo item
            this.items.push(item);
        }

        this.saveToLocalStorage();
        this.renderList();
    }

    // Editar item
    editItem(id, newCode, newDescription) {
        const itemIndex = this.items.findIndex(item => item.id === id);
        
        if (itemIndex !== -1) {
            // Atualizar item
            this.items[itemIndex].code = newCode;
            this.items[itemIndex].description = newDescription;
            
            this.saveToLocalStorage();
            this.renderList();
            return true;
        }
        
        return false;
    }

    // Excluir item
    deleteItem(id) {
        const itemIndex = this.items.findIndex(item => item.id === id);
        
        if (itemIndex !== -1) {
            // Remover item
            this.items.splice(itemIndex, 1);
            
            this.saveToLocalStorage();
            this.renderList();
            return true;
        }
        
        return false;
    }

    // Renderizar lista de itens
    renderList() {
        console.log(`Renderizando lista ${this.listId} com ${this.items.length} itens`);
        const listElement = document.getElementById(this.listId);
        
        if (listElement) {
            listElement.innerHTML = '';
            
            if (this.items.length === 0) {
                listElement.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum item cadastrado</td></tr>';
                return;
            }

            this.items.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.code}</td>
                    <td>${item.description}</td>
                    <td class="actions">
                        <button class="icon-action icon-edit" data-id="${item.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-action icon-delete" data-id="${item.id}" title="Excluir">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                
                // Adicionar event listeners para edição e exclusão
                const editBtn = tr.querySelector('.icon-edit');
                const deleteBtn = tr.querySelector('.icon-delete');
                
                editBtn.addEventListener('click', () => this.handleEditItem(item));
                deleteBtn.addEventListener('click', () => this.handleDeleteItem(item.id));
                
                listElement.appendChild(tr);
            });
        } else {
            console.error(`Elemento de lista não encontrado: ${this.listId}`);
        }
    }

    // Manipular edição de item
    handleEditItem(item) {
        const newCode = prompt('Digite o novo código:', item.code);
        const newDescription = prompt('Digite a nova descrição:', item.description);
        
        if (newCode && newDescription) {
            this.editItem(item.id, newCode, newDescription);
        }
    }

    // Manipular exclusão de item
    handleDeleteItem(id) {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            this.deleteItem(id);
        }
    }

    // Obter lista de itens para popular dropdowns
    getItemsForDropdown() {
        return this.items;
    }
}

// Inicializar gerenciadores de configuração
const cityManager = new ConfigManager('cities', 'cityList');
const moduleManager = new ConfigManager('modules', 'moduleList');
const columnManager = new ConfigManager('columns', 'columnList');
const levelManager = new ConfigManager('levels', 'levelList');

// Função para adicionar item e renderizar lista
function addItemAndRender(manager, code, description) {
    const newItem = new ConfigurableItem(code, description);
    manager.addItem(newItem);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado');
    
    // Renderizar todas as listas ao carregar a página
    cityManager.renderList();
    moduleManager.renderList();
    levelManager.renderList();
    columnManager.renderList();

    // Event listeners para formulários
    document.getElementById('cityForm')?.addEventListener('submit', function(event) {
        event.preventDefault();
        const code = document.getElementById('cityCode').value;
        const description = document.getElementById('cityDescription').value;
        addItemAndRender(cityManager, code, description);
        this.reset();
    });

    document.getElementById('moduleForm')?.addEventListener('submit', function(event) {
        event.preventDefault();
        const code = document.getElementById('moduleCode').value;
        const description = document.getElementById('moduleDescription').value;
        addItemAndRender(moduleManager, code, description);
        this.reset();
    });

    document.getElementById('levelForm')?.addEventListener('submit', function(event) {
        event.preventDefault();
        const code = document.getElementById('levelCode').value;
        const description = document.getElementById('levelDescription').value;
        addItemAndRender(levelManager, code, description);
        this.reset();
    });

    document.getElementById('columnForm')?.addEventListener('submit', function(event) {
        event.preventDefault();
        const code = document.getElementById('columnCode').value;
        const description = document.getElementById('columnDescription').value;
        addItemAndRender(columnManager, code, description);
        this.reset();
    });

    // Adicionar event listeners para as abas
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remover classe active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.style.display = 'none');
            
            // Adicionar classe active ao botão clicado e mostrar conteúdo correspondente
            button.classList.add('active');
            document.getElementById(tabId).style.display = 'block';

            // Renderizar a lista correspondente
            switch(tabId) {
                case 'cidades':
                    cityManager.renderList();
                    break;
                case 'modulos':
                    moduleManager.renderList();
                    break;
                case 'niveis':
                    levelManager.renderList();
                    break;
                case 'colunas':
                    columnManager.renderList();
                    break;
            }
        });
    });
});

// Funções de exportação e importação de dados
function exportData() {
    const exportData = {
        cidades: cityManager.items.map(item => ({
            codigo: item.code,
            nome: item.description
        })),
        modulos: moduleManager.items.map(item => ({
            codigo: item.code,
            descricao: item.description
        })),
        niveis: levelManager.items.map(item => ({
            codigo: item.code,
            descricao: item.description
        })),
        colunas: columnManager.items.map(item => ({
            codigo: item.code,
            descricao: item.description
        }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'optitask_config_export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Limpar dados existentes
            localStorage.removeItem('cities');
            localStorage.removeItem('modules');
            localStorage.removeItem('levels');
            localStorage.removeItem('columns');

            // Importar cidades
            if (importedData.cidades) {
                importedData.cidades.forEach(city => {
                    cityManager.addItem(new ConfigurableItem(city.codigo, city.nome));
                });
            }

            // Importar módulos
            if (importedData.modulos) {
                importedData.modulos.forEach(module => {
                    moduleManager.addItem(new ConfigurableItem(module.codigo, module.descricao));
                });
            }

            // Importar níveis
            if (importedData.niveis) {
                importedData.niveis.forEach(level => {
                    levelManager.addItem(new ConfigurableItem(level.codigo, level.descricao));
                });
            }

            // Importar colunas
            if (importedData.colunas) {
                importedData.colunas.forEach(column => {
                    columnManager.addItem(new ConfigurableItem(column.codigo, column.descricao));
                });
            }

            // Renderizar listas
            cityManager.renderList();
            moduleManager.renderList();
            levelManager.renderList();
            columnManager.renderList();

            alert('Dados importados com sucesso!');
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            alert('Erro ao importar dados. Verifique o formato do arquivo.');
        }
    };
    reader.readAsText(file);
}

// Adicionar event listeners para exportação e importação
document.getElementById('exportDataBtn')?.addEventListener('click', exportData);
document.getElementById('importDataBtn')?.addEventListener('click', () => {
    document.getElementById('importFileInput').click();
});
document.getElementById('importFileInput')?.addEventListener('change', importData);

// Lógica de gerenciamento de Categorias
document.addEventListener('DOMContentLoaded', () => {
    const categoryForm = document.getElementById('categoryForm');
    const categoryList = document.getElementById('categoryList');
    const skuCategorySelect = document.getElementById('skuCategory');

    // Função para adicionar Categoria
    function addCategory(event) {
        event.preventDefault();

        // Capturar valores dos campos
        const categoryCode = document.getElementById('categoryCode').value;
        const categoryDescription = document.getElementById('categoryDescription').value || '';

        // Criar objeto de Categoria
        const category = {
            code: categoryCode,
            description: categoryDescription
        };

        // Recuperar Categorias existentes
        let categories = JSON.parse(localStorage.getItem('categories') || '[]');

        // Verificar se já existe uma Categoria com o mesmo código
        const existingCategoryIndex = categories.findIndex(c => c.code === categoryCode);
        
        if (existingCategoryIndex !== -1) {
            // Atualizar Categoria existente
            categories[existingCategoryIndex] = category;
            alert('Categoria atualizada com sucesso!');
        } else {
            // Adicionar nova Categoria
            categories.push(category);
            alert('Categoria cadastrada com sucesso!');
        }

        // Salvar no localStorage
        localStorage.setItem('categories', JSON.stringify(categories));

        // Renderizar lista de Categorias
        renderCategoryTable();

        // Popular select de categorias no formulário de SKU
        populateCategorySelect();

        // Limpar formulário
        categoryForm.reset();
    }

    // Função para renderizar tabela de Categorias
    function renderCategoryTable() {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        // Limpar tabela existente
        categoryList.innerHTML = '';

        // Adicionar linhas à tabela
        categories.forEach((category, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.code}</td>
                <td>${category.description}</td>
                <td>
                    <button onclick="editCategory(${index})">Editar</button>
                    <button onclick="deleteCategory(${index})">Excluir</button>
                </td>
            `;
            categoryList.appendChild(row);
        });
    }

    // Função para popular select de categorias no formulário de SKU
    function populateCategorySelect() {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        // Limpar opções existentes
        skuCategorySelect.innerHTML = '<option value="">Selecione a Categoria</option>';

        // Adicionar categorias ao select
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.code;
            option.textContent = `${category.code} - ${category.description}`;
            skuCategorySelect.appendChild(option);
        });
    }

    // Função para editar Categoria
    window.editCategory = function(index) {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        const category = categories[index];

        // Preencher formulário com dados da Categoria
        document.getElementById('categoryCode').value = category.code;
        document.getElementById('categoryDescription').value = category.description;
    }

    // Função para excluir Categoria
    window.deleteCategory = function(index) {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        // Confirmar exclusão
        if (confirm('Tem certeza que deseja excluir esta Categoria?')) {
            categories.splice(index, 1);
            localStorage.setItem('categories', JSON.stringify(categories));
            renderCategoryTable();
            populateCategorySelect();
            alert('Categoria excluída com sucesso!');
        }
    }

    // Adicionar event listener para o formulário
    categoryForm.addEventListener('submit', addCategory);

    // Renderizar tabela ao carregar a página
    renderCategoryTable();
    populateCategorySelect();
});

// Adicionar lógica de gerenciamento de SKUs com localStorage
document.addEventListener('DOMContentLoaded', () => {
    const skuForm = document.getElementById('skuForm');
    const skuList = document.getElementById('skuList');
    const skuCategorySelect = document.getElementById('skuCategory');

    // Função para popular select de categorias
    function populateCategorySelect() {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        // Limpar opções existentes
        skuCategorySelect.innerHTML = '<option value="">Selecione a Categoria</option>';

        // Adicionar categorias ao select
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.code;
            option.textContent = `${category.code} - ${category.description}`;
            skuCategorySelect.appendChild(option);
        });
    }

    // Função para adicionar SKU
    function addSku(event) {
        event.preventDefault();

        // Capturar valores dos campos
        const skuCode = document.getElementById('skuCode').value;
        const skuDescription = document.getElementById('skuDescription').value || '';
        const skuCategory = document.getElementById('skuCategory').value;
        const skuWeight = document.getElementById('skuWeight').value;
        const skuDimensions = document.getElementById('skuDimensions').value;
        const skuPalletCapacity = document.getElementById('skuPalletCapacity').value;

        // Criar objeto de SKU
        const sku = {
            code: skuCode,
            description: skuDescription,
            category: skuCategory,
            weight: parseFloat(skuWeight) || null,
            dimensions: skuDimensions,
            palletCapacity: parseInt(skuPalletCapacity) || null
        };

        // Recuperar SKUs existentes
        let skus = JSON.parse(localStorage.getItem('skus') || '[]');

        // Verificar se já existe um SKU com o mesmo código
        const existingSkuIndex = skus.findIndex(s => s.code === skuCode);
        
        if (existingSkuIndex !== -1) {
            // Atualizar SKU existente
            skus[existingSkuIndex] = sku;
            alert('SKU atualizado com sucesso!');
        } else {
            // Adicionar novo SKU
            skus.push(sku);
            alert('SKU cadastrado com sucesso!');
        }

        // Salvar no localStorage
        localStorage.setItem('skus', JSON.stringify(skus));

        // Renderizar lista de SKUs
        renderSkuTable();

        // Limpar formulário
        skuForm.reset();
    }

    // Função para renderizar tabela de SKUs
    function renderSkuTable() {
        const skus = JSON.parse(localStorage.getItem('skus') || '[]');
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        // Limpar tabela existente
        skuList.innerHTML = '';

        // Adicionar linhas à tabela
        skus.forEach((sku, index) => {
            // Encontrar descrição da categoria
            const categoryDescription = categories.find(c => c.code === sku.category)?.description || sku.category;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sku.code}</td>
                <td>${sku.description}</td>
                <td>${sku.category} - ${categoryDescription}</td>
                <td>${sku.weight || '-'}</td>
                <td>${sku.dimensions || '-'}</td>
                <td>${sku.palletCapacity || '-'}</td>
                <td>
                    <button onclick="editSku(${index})">Editar</button>
                    <button onclick="deleteSku(${index})">Excluir</button>
                </td>
            `;
            skuList.appendChild(row);
        });
    }

    // Função para editar SKU
    window.editSku = function(index) {
        const skus = JSON.parse(localStorage.getItem('skus') || '[]');
        const sku = skus[index];

        // Preencher formulário com dados do SKU
        document.getElementById('skuCode').value = sku.code;
        document.getElementById('skuDescription').value = sku.description;
        document.getElementById('skuCategory').value = sku.category;
        document.getElementById('skuWeight').value = sku.weight;
        document.getElementById('skuDimensions').value = sku.dimensions;
        document.getElementById('skuPalletCapacity').value = sku.palletCapacity;
    }

    // Função para excluir SKU
    window.deleteSku = function(index) {
        const skus = JSON.parse(localStorage.getItem('skus') || '[]');
        
        // Confirmar exclusão
        if (confirm('Tem certeza que deseja excluir este SKU?')) {
            skus.splice(index, 1);
            localStorage.setItem('skus', JSON.stringify(skus));
            renderSkuTable();
            alert('SKU excluído com sucesso!');
        }
    }

    // Adicionar event listener para o formulário
    skuForm.addEventListener('submit', addSku);

    // Popular select de categorias
    populateCategorySelect();

    // Renderizar tabela ao carregar a página
    renderSkuTable();
});

// Adicionar lógica de tabs
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remover classe active de todos os botões
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Esconder todos os conteúdos
            tabContents.forEach(content => {
                content.style.display = 'none';
            });

            // Mostrar conteúdo selecionado
            document.getElementById(tabId).style.display = 'block';
        });
    });
});
