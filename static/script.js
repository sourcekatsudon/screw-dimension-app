let screwData = null;
let selectedItems = {
    bolts: {},
    nuts: {},
    washers: {}
};

const sizes = ['M2.5', 'M3', 'M4', 'M5', 'M6', 'M8', 'M10'];

async function loadScrewData() {
    try {
        const response = await fetch('/api/screws');
        screwData = await response.json();
        createCheckboxes();
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
    }
}

function createCheckboxes() {
    createCategoryCheckboxes('bolts', 'bolts-container');
    createCategoryCheckboxes('nuts', 'nuts-container');
    createCategoryCheckboxes('washers', 'washers-container');
}

function createCategoryCheckboxes(category, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (const [typeKey, typeData] of Object.entries(screwData[category])) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'item-group';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'item-group-title';
        titleDiv.textContent = typeData.name;
        groupDiv.appendChild(titleDiv);
        
        sizes.forEach(size => {
            if (typeData.dimensions[size]) {
                const checkboxDiv = document.createElement('div');
                checkboxDiv.className = 'item-checkbox';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `${category}-${typeKey}-${size}`;
                checkbox.addEventListener('change', () => {
                    handleCheckboxChange(category, typeKey, size, checkbox.checked);
                });
                
                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.textContent = `${size} (${typeData.standard})`;
                
                // 図面ツールチップを追加
                createDiagramTooltip(typeKey, checkboxDiv);
                
                checkboxDiv.appendChild(checkbox);
                checkboxDiv.appendChild(label);
                groupDiv.appendChild(checkboxDiv);
            }
        });
        
        container.appendChild(groupDiv);
    }
}

function handleCheckboxChange(category, type, size, isChecked) {
    if (!selectedItems[category][size]) {
        selectedItems[category][size] = {};
    }
    
    if (isChecked) {
        selectedItems[category][size][type] = screwData[category][type];
    } else {
        delete selectedItems[category][size][type];
        if (Object.keys(selectedItems[category][size]).length === 0) {
            delete selectedItems[category][size];
        }
    }
    
    updateDimensionsDisplay();
}

function updateDimensionsDisplay() {
    const displayContainer = document.getElementById('dimensions-display');
    displayContainer.innerHTML = '';
    
    const hasSelection = Object.keys(selectedItems.bolts).length > 0 ||
                        Object.keys(selectedItems.nuts).length > 0 ||
                        Object.keys(selectedItems.washers).length > 0;
    
    if (!hasSelection) {
        displayContainer.innerHTML = '<p class="placeholder">左側から部品を選択してください</p>';
        return;
    }
    
    sizes.forEach(size => {
        const sizeItems = {
            bolts: selectedItems.bolts[size] || {},
            nuts: selectedItems.nuts[size] || {},
            washers: selectedItems.washers[size] || {}
        };
        
        const hasItemsForSize = Object.keys(sizeItems.bolts).length > 0 ||
                               Object.keys(sizeItems.nuts).length > 0 ||
                               Object.keys(sizeItems.washers).length > 0;
        
        if (hasItemsForSize) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'dimension-group';
            
            const groupTitle = document.createElement('h3');
            groupTitle.textContent = `${size} サイズの寸法`;
            groupDiv.appendChild(groupTitle);
            
            const table = createDimensionTable(size, sizeItems);
            groupDiv.appendChild(table);
            
            displayContainer.appendChild(groupDiv);
        }
    });
}

function createDimensionTable(size, sizeItems) {
    const table = document.createElement('table');
    table.className = 'dimension-table';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>部品名</th>
        <th>直径/内径<br><span class="min-value">最小</span> - <span class="nominal-value">公称</span> - <span class="max-value">最大</span></th>
        <th>頭径/外径<br><span class="min-value">最小</span> - <span class="nominal-value">公称</span> - <span class="max-value">最大</span></th>
        <th>頭高/厚さ<br><span class="min-value">最小</span> - <span class="nominal-value">公称</span> - <span class="max-value">最大</span></th>
    `;
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    const allDimensions = [];
    
    // ボルト・ネジ
    for (const [typeKey, typeData] of Object.entries(sizeItems.bolts)) {
        const row = createDimensionRow(typeData.name, typeData.dimensions[size], 'bolt');
        tbody.appendChild(row);
        allDimensions.push({ type: 'bolt', dimensions: typeData.dimensions[size] });
    }
    
    // ナット
    for (const [typeKey, typeData] of Object.entries(sizeItems.nuts)) {
        const row = createDimensionRow(typeData.name, typeData.dimensions[size], 'nut');
        tbody.appendChild(row);
        allDimensions.push({ type: 'nut', dimensions: typeData.dimensions[size] });
    }
    
    // ワッシャー
    for (const [typeKey, typeData] of Object.entries(sizeItems.washers)) {
        const row = createDimensionRow(typeData.name, typeData.dimensions[size], 'washer');
        tbody.appendChild(row);
        allDimensions.push({ type: 'washer', dimensions: typeData.dimensions[size] });
    }
    
    // 最大・最小値の集計行を追加
    if (allDimensions.length > 0) {
        const summaryRow = createSummaryRow(allDimensions);
        tbody.appendChild(summaryRow);
    }
    
    table.appendChild(tbody);
    return table;
}

function createDimensionRow(name, dimensions, type) {
    const row = document.createElement('tr');
    
    const nameCell = document.createElement('td');
    nameCell.className = 'part-name';
    nameCell.textContent = name;
    row.appendChild(nameCell);
    
    if (type === 'bolt') {
        row.appendChild(createDimensionCell(dimensions.diameter));
        row.appendChild(createDimensionCell(dimensions.head_diameter));
        row.appendChild(createDimensionCell(dimensions.head_height));
    } else if (type === 'nut' || type === 'washer') {
        row.appendChild(createDimensionCell(dimensions.inner_diameter));
        row.appendChild(createDimensionCell(dimensions.outer_diameter));
        row.appendChild(createDimensionCell(dimensions.thickness));
    }
    
    return row;
}

function createDimensionCell(dimension) {
    const cell = document.createElement('td');
    cell.innerHTML = `
        <span class="min-value">${dimension.min.toFixed(2)}</span> - 
        <span class="nominal-value">${dimension.nominal.toFixed(1)}</span> - 
        <span class="max-value">${dimension.max.toFixed(2)}</span>
    `;
    return cell;
}

function createSummaryRow(allDimensions) {
    const row = document.createElement('tr');
    row.className = 'summary-row';
    
    const nameCell = document.createElement('td');
    nameCell.className = 'summary-label';
    nameCell.textContent = '集計（最小/最大）';
    row.appendChild(nameCell);
    
    // 各列の最小・最大値を計算
    const dim1Values = { min: [], max: [] };
    const dim2Values = { min: [], max: [] };
    const dim3Values = { min: [], max: [] };
    
    allDimensions.forEach(item => {
        if (item.type === 'bolt') {
            dim1Values.min.push(item.dimensions.diameter.min);
            dim1Values.max.push(item.dimensions.diameter.max);
            dim2Values.min.push(item.dimensions.head_diameter.min);
            dim2Values.max.push(item.dimensions.head_diameter.max);
            dim3Values.min.push(item.dimensions.head_height.min);
            dim3Values.max.push(item.dimensions.head_height.max);
        } else if (item.type === 'nut' || item.type === 'washer') {
            dim1Values.min.push(item.dimensions.inner_diameter.min);
            dim1Values.max.push(item.dimensions.inner_diameter.max);
            dim2Values.min.push(item.dimensions.outer_diameter.min);
            dim2Values.max.push(item.dimensions.outer_diameter.max);
            dim3Values.min.push(item.dimensions.thickness.min);
            dim3Values.max.push(item.dimensions.thickness.max);
        }
    });
    
    // 最小値と最大値を求める
    const createSummaryCell = (values) => {
        const cell = document.createElement('td');
        cell.className = 'summary-cell';
        if (values.min.length > 0) {
            const minValue = Math.min(...values.min);
            const maxValue = Math.max(...values.max);
            cell.innerHTML = `
                <span class="summary-min">${minValue.toFixed(2)}</span> / 
                <span class="summary-max">${maxValue.toFixed(2)}</span>
            `;
        } else {
            cell.textContent = '-';
        }
        return cell;
    };
    
    row.appendChild(createSummaryCell(dim1Values));
    row.appendChild(createSummaryCell(dim2Values));
    row.appendChild(createSummaryCell(dim3Values));
    
    return row;
}

// ページ読み込み時にデータを取得
document.addEventListener('DOMContentLoaded', loadScrewData);