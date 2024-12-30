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
const categoryManager = new ConfigManager('categories', 'categoryList');
const skuManager = new ConfigManager('skus', 'skuList');

// Função para adicionar item e renderizar lista
function addItemAndRender(manager, code, description) {
    const newItem = new ConfigurableItem(code, description);
    manager.addItem(newItem);
}

// Renderizar todas as listas após o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado');
    
    // Renderizar todas as listas ao carregar a página
    cityManager.renderList();
    moduleManager.renderList();
    levelManager.renderList();
    columnManager.renderList();
    categoryManager.renderList();
    skuManager.renderList();

    const forms = [
        { id: 'cityForm', manager: cityManager },
        { id: 'moduleForm', manager: moduleManager },
        { id: 'levelForm', manager: levelManager },
        { id: 'columnForm', manager: columnManager },
        { id: 'categoryForm', manager: categoryManager }
    ];

    forms.forEach(({ id, manager }) => {
        const form = document.getElementById(id);
        if (form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                const code = this.querySelector('[id$="Code"]').value.trim();
                const description = this.querySelector('[id$="Description"]').value.trim();

                if (!code || !description) {
                    alert('Código e Descrição são obrigatórios');
                    return;
                }

                manager.addItem(new ConfigurableItem(code, description));
                manager.renderList();
                this.reset();
            });
        }
    });

    const skuForm = document.getElementById('skuForm');
    if (skuForm) {
        skuForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log(' Formulário de SKU submetido');

            const code = document.getElementById('skuCode').value.trim();
            const description = document.getElementById('skuDescription').value.trim();
            const category = document.getElementById('skuCategory').value.trim();
            const weight = document.getElementById('skuWeight').value.trim();
            const dimensions = document.getElementById('skuDimensions').value.trim();
            const palletCapacity = document.getElementById('skuPalletCapacity').value.trim();

            console.log(' Valores recuperados:', {
                code,
                description,
                category,
                weight,
                dimensions,
                palletCapacity
            });

            if (!code || !description) {
                alert('Código e Descrição são obrigatórios');
                return;
            }

            const newSku = {
                id: `sku_${Date.now()}`,
                code: code,
                description: description,
                category: category || null,
                weight: weight ? parseFloat(weight) : null,
                dimensions: dimensions || null,
                palletCapacity: palletCapacity ? parseInt(palletCapacity) : null
            };

            console.log(' Novo SKU criado:', newSku);

            const skus = JSON.parse(localStorage.getItem('skus') || '[]');
            console.log(' SKUs existentes antes da adição:', skus);

            const existingSkuIndex = skus.findIndex(s => s.code === code);
            if (existingSkuIndex !== -1) {
                skus[existingSkuIndex] = newSku;
            } else {
                skus.push(newSku);
            }

            localStorage.setItem('skus', JSON.stringify(skus));
            console.log(' SKUs após adição:', JSON.parse(localStorage.getItem('skus') || '[]'));

            renderSkuTable();
            skuForm.reset();
        });
    }

    renderSkuTable();
});

// Event listeners para as abas
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
            case 'categorias':
                categoryManager.renderList();
                break;
            case 'sku':
                skuManager.renderList();
                break;
        }
    });
});

// Funções de exportação e importação de dados
function exportData() {
    const dataToExport = {
        positions: JSON.parse(localStorage.getItem('positions') || '[]'),
        skus: JSON.parse(localStorage.getItem('skus') || '[]'),
        tasks: JSON.parse(localStorage.getItem('todoList') || '[]'),
        cidades: JSON.parse(localStorage.getItem('cities') || '[]'),
        modulos: JSON.parse(localStorage.getItem('modules') || '[]'),
        niveis: JSON.parse(localStorage.getItem('levels') || '[]'),
        colunas: JSON.parse(localStorage.getItem('columns') || '[]'),
        categorias: JSON.parse(localStorage.getItem('categories') || '[]')
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optitask_export_${new Date().toISOString().replace(/:/g, '-')}.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
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
                    
                    console.log('Dados importados:', importedData);
                    
                    if (importedData.positions && importedData.skus && importedData.tasks) {
                        localStorage.setItem('positions', JSON.stringify(importedData.positions));
                        localStorage.setItem('skus', JSON.stringify(importedData.skus));
                        localStorage.setItem('todoList', JSON.stringify(importedData.tasks));
                        
                        localStorage.setItem('cities', JSON.stringify(importedData.cidades || []));
                        localStorage.setItem('modules', JSON.stringify(importedData.modulos || []));
                        localStorage.setItem('levels', JSON.stringify(importedData.niveis || []));
                        localStorage.setItem('columns', JSON.stringify(importedData.colunas || []));
                        localStorage.setItem('categories', JSON.stringify(importedData.categorias || []));
                        
                        console.log('Dados salvos no localStorage');
                        
                        window.location.reload();
                    } else {
                        console.error('Estrutura de dados inválida:', importedData);
                        alert('Formato de arquivo inválido. Verifique o console para mais detalhes.');
                    }
                } catch (error) {
                    console.error('Erro ao importar arquivo:', error);
                    alert('Erro ao importar arquivo: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Adicionar event listeners para exportação e importação
document.addEventListener('DOMContentLoaded', () => {
    const exportButton = document.getElementById('exportData');
    const importButton = document.getElementById('importData');
    
    if (exportButton) {
        exportButton.addEventListener('click', exportData);
    }
    
    if (importButton) {
        importButton.addEventListener('click', importData);
    }
});

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
        if (confirm('Tem certeza que deseja excluir esta Categoria?')) {
            const categories = JSON.parse(localStorage.getItem('categories') || '[]');
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

// Lógica de gerenciamento de SKUs com localStorage
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
        console.log(' Iniciando addSku()');
        
        // Recuperar valores dos campos
        const code = document.getElementById('skuCode').value;
        const description = document.getElementById('skuDescription').value;
        const category = document.getElementById('skuCategory').value;
        const weight = document.getElementById('skuWeight').value;
        const dimensions = document.getElementById('skuDimensions').value;
        const palletCapacity = document.getElementById('skuPalletCapacity').value;

        console.log(' Valores recuperados:', {
            code,
            description,
            category,
            weight,
            dimensions,
            palletCapacity
        });

        // Validar campos obrigatórios
        if (!code || !description) {
            console.error(' Código e Descrição são obrigatórios');
            alert('Código e Descrição são obrigatórios');
            return;
        }

        // Criar objeto SKU com todos os campos
        const newSku = {
            id: `sku_${Date.now()}`,
            code: code,
            description: description,
            category: category,
            weight: weight ? parseFloat(weight) : null,
            dimensions: dimensions || null,
            palletCapacity: palletCapacity ? parseInt(palletCapacity) : null
        };

        console.log(' Novo SKU criado:', newSku);

        // Adicionar SKU à lista
        const skus = JSON.parse(localStorage.getItem('skus') || '[]');
        console.log(' SKUs existentes antes da adição:', skus);

        // Verificar se já existe um SKU com o mesmo código
        const existingSkuIndex = skus.findIndex(s => s.code === code);
        
        if (existingSkuIndex !== -1) {
            console.warn(` SKU com código ${code} já existe. Substituindo.`);
            skus[existingSkuIndex] = newSku;
        } else {
            skus.push(newSku);
        }

        localStorage.setItem('skus', JSON.stringify(skus));

        console.log(' SKUs após adição:', JSON.parse(localStorage.getItem('skus') || '[]'));

        // Renderizar tabela atualizada
        renderSkuTable();

        // Limpar formulário
        document.getElementById('skuForm').reset();
    }

    // Função para renderizar tabela de SKUs
    function renderSkuTable() {
        console.log(' Iniciando renderSkuTable()');
        
        const skus = JSON.parse(localStorage.getItem('skus') || '[]');

        console.log(' SKUs para renderizar:', skus);

        // Limpar tabela anterior
        skuList.innerHTML = '';

        if (skus.length === 0) {
            console.log(' Nenhum SKU cadastrado');
            skuList.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum SKU cadastrado</td></tr>';
            return;
        }

        skus.forEach((sku, index) => {
            console.log(` Renderizando SKU ${index + 1}:`, sku);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sku.code}</td>
                <td>${sku.description}</td>
                <td>${sku.category}</td>
                <td>${sku.weight ? sku.weight.toFixed(2) : 'N/A'}</td>
                <td>${sku.dimensions || 'N/A'}</td>
                <td>${sku.palletCapacity || 'N/A'}</td>
                <td class="actions">
                    <button class="icon-action icon-edit" onclick="editSku(${index})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-action icon-delete" onclick="deleteSku(${index})" title="Excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            skuList.appendChild(tr);
        });

        console.log(' Tabela de SKUs renderizada');
    }

    // Função para editar SKU
    window.editSku = function(index) {
        const skus = JSON.parse(localStorage.getItem('skus') || '[]');
        const sku = skus[index];

        // Preencher formulário com dados atuais
        document.getElementById('skuCode').value = sku.code;
        document.getElementById('skuDescription').value = sku.description;
        document.getElementById('skuCategory').value = sku.category || '';
        document.getElementById('skuWeight').value = sku.weight || '';
        document.getElementById('skuDimensions').value = sku.dimensions || '';
        document.getElementById('skuPalletCapacity').value = sku.palletCapacity || '';
        
        // Remover item da lista para ser substituído
        skus.splice(index, 1);
        localStorage.setItem('skus', JSON.stringify(skus));

        // Renderizar tabela atualizada
        renderSkuTable();
    }

    // Função para excluir SKU
    window.deleteSku = function(index) {
        if (confirm('Tem certeza que deseja excluir este SKU?')) {
            const skus = JSON.parse(localStorage.getItem('skus') || '[]');
            skus.splice(index, 1);
            localStorage.setItem('skus', JSON.stringify(skus));
            renderSkuTable();
        }
    }

    // Adicionar event listener para o formulário
    skuForm.addEventListener('submit', addSku);

    // Popular select de categorias
    populateCategorySelect();

    // Renderizar tabela ao carregar a página
    renderSkuTable();
});

// Lógica de tabs
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
                case 'categorias':
                    categoryManager.renderList();
                    break;
                case 'sku':
                    skuManager.renderList();
                    break;
            }
        });
    });
});

// Event listeners para exportação e importação
document.addEventListener('DOMContentLoaded', () => {
    const exportButton = document.getElementById('exportData');
    const importButton = document.getElementById('importData');
    const importInput = document.getElementById('importFileInput');

    if (exportButton) {
        exportButton.addEventListener('click', exportData);
    } else {
        console.error(' Botão de exportação não encontrado!');
    }

    if (importButton && importInput) {
        importButton.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', importData);
    } else {
        console.error(' Botão ou input de importação não encontrado!');
    }

    function exportData() {
        console.log(' Exportando dados...');
        const data = {
            cidades: cityManager.items,
            modulos: moduleManager.items,
            niveis: levelManager.items,
            colunas: columnManager.items,
            categorias: categoryManager.items,
            skus: skuManager.items
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'configuracoes.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log(' Dados exportados com sucesso!');
    }

    function importData(event) {
        console.log(' Importando dados...');
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    console.log(' Dados importados:', importedData);
                    // Atualizar localStorage com os dados importados
                    localStorage.setItem('cities', JSON.stringify(importedData.cidades || []));
                    localStorage.setItem('modules', JSON.stringify(importedData.modulos || []));
                    localStorage.setItem('levels', JSON.stringify(importedData.niveis || []));
                    localStorage.setItem('columns', JSON.stringify(importedData.colunas || []));
                    localStorage.setItem('categories', JSON.stringify(importedData.categorias || []));
                    localStorage.setItem('skus', JSON.stringify(importedData.skus || []));
                    // Re-renderizar listas
                    cityManager.renderList();
                    moduleManager.renderList();
                    levelManager.renderList();
                    columnManager.renderList();
                    categoryManager.renderList();
                    skuManager.renderList();
                    console.log(' Dados importados e atualizados com sucesso!');
                } catch (error) {
                    console.error(' Erro ao importar dados:', error);
                }
            };
            reader.readAsText(file);
        }
    }
});

// Função para renderizar tabela de SKUs
function renderSkuTable() {
    console.log(' Iniciando renderSkuTable()');
    
    const skuList = document.getElementById('skuList');
    
    if (!skuList) {
        console.error(' Elemento skuList não encontrado!');
        return;
    }

    const skus = JSON.parse(localStorage.getItem('skus') || '[]');

    console.log(' SKUs para renderizar:', skus);

    // Limpar tabela anterior
    skuList.innerHTML = '';

    if (skus.length === 0) {
        console.log(' Nenhum SKU cadastrado');
        skuList.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum SKU cadastrado</td></tr>';
        return;
    }

    skus.forEach((sku, index) => {
        console.log(` Renderizando SKU ${index + 1}:`, sku);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sku.code}</td>
            <td>${sku.description}</td>
            <td>${sku.category || 'N/A'}</td>
            <td>${sku.weight ? sku.weight.toFixed(2) : 'N/A'}</td>
            <td>${sku.dimensions || 'N/A'}</td>
            <td>${sku.palletCapacity || 'N/A'}</td>
            <td class="actions">
                <button class="icon-action icon-edit" onclick="editSku(${index})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-action icon-delete" onclick="deleteSku(${index})" title="Excluir">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        skuList.appendChild(tr);
    });

    console.log(' Tabela de SKUs renderizada');
}

document.addEventListener('DOMContentLoaded', () => {
    const skuForm = document.getElementById('skuForm');
    
    if (!skuForm) {
        console.error(' Formulário de SKU não encontrado!');
        return;
    }

    // Remover todos os event listeners existentes
    const oldSubmitHandler = skuForm.getAttribute('data-submit-handler');
    if (oldSubmitHandler && window[oldSubmitHandler]) {
        skuForm.removeEventListener('submit', window[oldSubmitHandler]);
    }

    function handleSkuSubmit(event) {
        event.preventDefault();
        console.log(' Formulário de SKU submetido');

        // Recuperar valores dos campos
        const code = document.getElementById('skuCode').value.trim();
        const description = document.getElementById('skuDescription').value.trim();
        const category = document.getElementById('skuCategory').value.trim();
        const weight = document.getElementById('skuWeight').value.trim();
        const dimensions = document.getElementById('skuDimensions').value.trim();
        const palletCapacity = document.getElementById('skuPalletCapacity').value.trim();

        console.log(' Valores recuperados:', {
            code,
            description,
            category,
            weight,
            dimensions,
            palletCapacity
        });

        // Validar campos obrigatórios
        if (!code || !description) {
            console.error(' Código e Descrição são obrigatórios');
            alert('Código e Descrição são obrigatórios');
            return;
        }

        // Criar objeto SKU com todos os campos
        const newSku = {
            id: `sku_${Date.now()}`,
            code: code,
            description: description,
            category: category || null,
            weight: weight ? parseFloat(weight) : null,
            dimensions: dimensions || null,
            palletCapacity: palletCapacity ? parseInt(palletCapacity) : null
        };

        console.log(' Novo SKU criado:', newSku);

        // Adicionar SKU à lista
        const skus = JSON.parse(localStorage.getItem('skus') || '[]');
        console.log(' SKUs existentes antes da adição:', skus);

        // Verificar se já existe um SKU com o mesmo código
        const existingSkuIndex = skus.findIndex(s => s.code === code);
        
        if (existingSkuIndex !== -1) {
            console.warn(` SKU com código ${code} já existe. Substituindo.`);
            skus[existingSkuIndex] = newSku;
        } else {
            skus.push(newSku);
        }

        localStorage.setItem('skus', JSON.stringify(skus));

        console.log(' SKUs após adição:', JSON.parse(localStorage.getItem('skus') || '[]'));

        // Renderizar tabela atualizada
        renderSkuTable();

        // Limpar formulário
        skuForm.reset();
    }

    // Adicionar novo event listener e armazenar referência
    const handlerName = 'handleSkuSubmit_' + Date.now();
    window[handlerName] = handleSkuSubmit;
    skuForm.addEventListener('submit', handleSkuSubmit);
    skuForm.setAttribute('data-submit-handler', handlerName);

    function renderSkuTable() {
        console.log(' Iniciando renderSkuTable()');
        
        const skuList = document.getElementById('skuList');
        
        if (!skuList) {
            console.error(' Elemento skuList não encontrado!');
            return;
        }

        const skus = JSON.parse(localStorage.getItem('skus') || '[]');

        console.log(' SKUs para renderizar:', skus);

        // Limpar tabela anterior
        skuList.innerHTML = '';

        if (skus.length === 0) {
            console.log(' Nenhum SKU cadastrado');
            skuList.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum SKU cadastrado</td></tr>';
            return;
        }

        skus.forEach((sku, index) => {
            console.log(` Renderizando SKU ${index + 1}:`, sku);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sku.code}</td>
                <td>${sku.description}</td>
                <td>${sku.category || 'N/A'}</td>
                <td>${sku.weight ? sku.weight.toFixed(2) : 'N/A'}</td>
                <td>${sku.dimensions || 'N/A'}</td>
                <td>${sku.palletCapacity || 'N/A'}</td>
                <td class="actions">
                    <button class="icon-action icon-edit" onclick="editSku(${index})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-action icon-delete" onclick="deleteSku(${index})" title="Excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            skuList.appendChild(tr);
        });

        console.log(' Tabela de SKUs renderizada');
    }

    // Renderizar tabela de SKUs ao carregar a página
    renderSkuTable();
});
