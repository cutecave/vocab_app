// ====== 全域變數 ======
let selectedWords = new Set(); // 用 Set 儲存選中的單字（不重複）
let currentSort = { key: 'date', order: 'desc' }; // 預設按日期降序

// ====== 處理文字：把句子拆成可點擊的單字 ======
function processText() {
    const text = document.getElementById('articleInput').value.trim();
    if (!text) {
        showToast('請先輸入文字！', 'error');
        return;
    }

    const displayArea = document.getElementById('displayArea');
    selectedWords.clear(); // 清空之前選的單字
    
    // 用正則表達式分割：單字（包含 apostrophe）和標點符號
    const tokens = text.match(/\b[\w']+\b|[^\w\s]/g) || [];
    
    let html = '';
    tokens.forEach((token, index) => {
        if (/\b[\w']+\b/.test(token)) {
            // 是單字 → 包成可點擊的 span
            html += `<span class="word" onclick="toggleWord(this)">${token}</span>`;
        } else {
            // 是標點符號 → 直接顯示
            html += token;
        }
        
        // 單字後面加空格（除非下一個是標點）
        if (index < tokens.length - 1 && /\b[\w']+\b/.test(token)) {
            const nextToken = tokens[index + 1];
            if (/\b[\w']+\b/.test(nextToken)) {
                html += ' ';
            }
        }
    });
    
    displayArea.innerHTML = html;
    displayArea.style.display = 'block';
    updateSelectedCount();
}

// ====== 點擊單字：智慧選取（支援片語） ======
function toggleWord(element) {
    if (element.classList.contains('selected')) {
        // 取消選取
        element.classList.remove('selected');
        // 重新計算所有片語
        rebuildPhrases();
    } else {
        // 選取
        element.classList.add('selected');
        // 重新計算所有片語
        rebuildPhrases();
    }
    
    updateSelectedCount();
}

// 重新計算所有片語：把相鄰的選中單字組成片語
function rebuildPhrases() {
    selectedWords.clear();
    
    const allWords = Array.from(document.querySelectorAll('.word'));
    let i = 0;
    
    while (i < allWords.length) {
        if (allWords[i].classList.contains('selected')) {
            // 找出連續選中的單字
            const phraseWords = [];
            while (i < allWords.length && allWords[i].classList.contains('selected')) {
                phraseWords.push(allWords[i].textContent);
                i++;
            }
            // 組成片語或單字
            const phrase = phraseWords.join(' ');
            selectedWords.add(phrase);
        } else {
            i++;
        }
    }
}

// ====== 更新已選單字計數 ======
function updateSelectedCount() {
    const countDiv = document.getElementById('selectedCount');
    const saveBtn = document.getElementById('saveButton');
    
    if (selectedWords.size > 0) {
        countDiv.textContent = `已選擇 ${selectedWords.size} 個單字：${Array.from(selectedWords).join(', ')}`;
        countDiv.style.display = 'block';
        saveBtn.style.display = 'inline-block';
    } else {
        countDiv.style.display = 'none';
        saveBtn.style.display = 'none';
    }
}

// ====== 儲存選取的單字（儲存後取消選取） ======
function saveSelection() {
    if (selectedWords.size === 0) {
        //alert('請先選擇至少一個單字！');
        return;
    }

    const sentence = document.getElementById('articleInput').value.trim();
    const source = document.getElementById('sourceInput').value.trim() || 'unknown';
    const words = Array.from(selectedWords);
    
    // 從 localStorage 讀取現有資料
    let items = JSON.parse(localStorage.getItem('words')) || [];
    
    // 【重點】檢查是否已有相同的句子
    const existingIndex = items.findIndex(item => item.context === sentence);
    
    if (existingIndex !== -1) {
        // 已存在 → 合併單字（不重複）
        const existingWords = items[existingIndex].words;
        const mergedWords = [...new Set([...existingWords, ...words])];
        items[existingIndex].words = mergedWords;
        items[existingIndex].date = new Date().toISOString(); // 更新時間
        //alert(`✅ 已將新單字/片語合併到現有例句！（共 ${mergedWords.length} 個）`);
    } else {
        // 不存在 → 新增
        items.unshift({
            context: sentence,
            words: words,
            source: source,
            date: new Date().toISOString()
        });
        //alert('✅ 儲存成功！');
    }

    localStorage.setItem('words', JSON.stringify(items));
    
    // 【重點】儲存後取消選取（但保留文字和處理後的顯示）
    document.querySelectorAll('.word.selected').forEach(el => {
        el.classList.remove('selected');
    });
    selectedWords.clear();
    updateSelectedCount();
    displayWords();
}

// ====== 清除輸入 ======
function clearInput() {
    document.getElementById('articleInput').value = '';
    document.getElementById('sourceInput').value = '';
    document.getElementById('displayArea').innerHTML = '';
    document.getElementById('displayArea').style.display = 'none';
    selectedWords.clear();
    updateSelectedCount();
}

// ====== 顯示單字列表（保留你的 checkbox 設計） ======
function displayWords() {
    const items = JSON.parse(localStorage.getItem('words')) || [];
    const wordList = document.getElementById('wordList');
    const showContext = document.getElementById('displayContext').checked;

    if (items.length === 0) {
        wordList.innerHTML = '<div class="empty-state">還沒有儲存任何例句喔～</div>';
        return;
    }

    let html = '';
    items.forEach((item, index) => {
        // 高亮單字
        let displayText = item.context;
        if (showContext) {
            item.words.forEach(word => {
                const regex = new RegExp(`\\b(${word})\\b`, 'gi');
                displayText = displayText.replace(regex, '<strong style="background: #ffd700; padding: 2px 4px; border-radius: 3px;">$1</strong>');
            });
        }

        html += `
            <div class="word-item" data-index="${index}" onclick="showFlashcard('${item.words.join(', ')}', \`${item.context}\`)">
                <div class="word-item-header">
                    <input type="checkbox" data-index="${index}" onchange="updateDeleteButton()">
                    <span class="word-item-title">${index}. ${item.words.join(', ')}</span>
                </div>
                <div class="word-tags">
                    ${item.words.map(w => `<span class="word-tag">${w}</span>`).join('')}
                </div>
                ${showContext ? `<div class="context-text">${displayText}</div>` : ''}
                <div class="meta-info">
                    來源: ${item.source} | 建立: ${new Date(item.date).toLocaleString('zh-TW')}
                </div>
            </div>
        `;
    });

    wordList.innerHTML = html;
}

// ====== 全選 / 取消全選 ======
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('#wordList input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updateDeleteButton();
}

// ====== 更新刪除按鈕顯示 ======
function updateDeleteButton() {
    const deleteBtn = document.getElementById('deleteButton');
    const checkedCount = document.querySelectorAll('#wordList input[type="checkbox"]:checked').length;
    deleteBtn.style.display = checkedCount > 0 ? 'inline-block' : 'none';
}

// ====== 刪除選取的項目 ======
function deleteSelected() {
    const checkedIndexes = Array.from(document.querySelectorAll('#wordList input[type="checkbox"]:checked'))
        .map(cb => parseInt(cb.getAttribute('data-index')));
    
    if (checkedIndexes.length === 0) return;
    
    if (!confirm(`確定要刪除 ${checkedIndexes.length} 個項目嗎？`)) return;

    let items = JSON.parse(localStorage.getItem('words')) || [];
    items = items.filter((_, i) => !checkedIndexes.includes(i));
    localStorage.setItem('words', JSON.stringify(items));
    
    document.getElementById('selectAll').checked = false;
    displayWords();
}

// ====== 排序（保留你的邏輯） ======
function sortWords(sortKey) {
    let items = JSON.parse(localStorage.getItem('words')) || [];
    
    // 如果點同一個按鈕，就反轉順序
    if (currentSort.key === sortKey) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.key = sortKey;
        currentSort.order = 'asc';
    }
    
    // 排序邏輯
    if (sortKey === 'date') {
        items.sort((a, b) => {
            const diff = new Date(a.date) - new Date(b.date);
            return currentSort.order === 'asc' ? diff : -diff;
        });
    } else if (sortKey === 'word') {
        items.sort((a, b) => {
            const result = a.words[0].localeCompare(b.words[0]);
            return currentSort.order === 'asc' ? result : -result;
        });
    } else if (sortKey === 'sentence') {
        items.sort((a, b) => {
            const result = a.context.localeCompare(b.context);
            return currentSort.order === 'asc' ? result : -result;
        });
    }
    
    localStorage.setItem('words', JSON.stringify(items));
    displayWords();
}

// ====== 匯出資料 ======
function exportData() {
    const data = localStorage.getItem('words');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `words_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ====== 匯入資料 ======
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    localStorage.setItem('words', JSON.stringify(data));
                    displayWords();
                    //alert('✅ 匯入成功！');
                } catch (err) {
                    //alert('❌ 匯入失敗：檔案格式錯誤');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}


// ====== 頁面載入時顯示資料 ======
window.onload = function() {
    displayWords();

    document.getElementById('processButton').addEventListener('click', processText);
    document.getElementById('clearButton').addEventListener('click', clearInput);
    document.getElementById('saveButton').addEventListener('click', saveSelection);

    document.getElementById('selectAll').addEventListener('change', toggleSelectAll);
    document.getElementById('displayContext').addEventListener('change', displayWords);
    document.getElementById('deleteButton').addEventListener('click', deleteSelected);
    document.getElementById('sortWordsButton').addEventListener('click', () => {
        sortWords('word');
    });
    document.getElementById('sortSentenceButton').addEventListener('click', () => {
        sortWords('sentence');
    });
    document.getElementById('sortDateButton').addEventListener('click', () => {
        sortWords('date');
    });
    document.getElementById('exportDataButton').addEventListener('click', exportData);
    document.getElementById('importDataButton').addEventListener('click', importData);
};