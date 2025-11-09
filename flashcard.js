function showFlashcard(word, sentence) {
    // 建立遮罩層（半透明背景）
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // 建立卡片
    const card = document.createElement('div');
    card.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 40px;
        max-width: 600px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        position: relative;
        animation: slideIn 0.3s ease-out;
    `;
    
    // 關閉按鈕
    const closeButton = document.createElement('button');
    closeButton.textContent = "✕";
    closeButton.className = "btn btn-danger";
    closeButton.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        padding: 0;
        font-size: 20px;
        line-height: 1;
    `;
    closeButton.onclick = () => hideFlashcard();

    // 單字標題
    const wordElement = document.createElement('div');
    wordElement.textContent = word;
    wordElement.style.cssText = `
        font-size: 32px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 20px;
        text-align: center;
    `;
    
    // 分隔線
    const divider = document.createElement('div');
    divider.style.cssText = `
        height: 2px;
        background: linear-gradient(to right, transparent, #667eea, transparent);
        margin: 20px 0;
    `;
    
    // 例句容器
    const sentenceContainer = document.createElement('div');
    sentenceContainer.style.cssText = `
        position: relative;
        background: #f7fafc;
        border-radius: 12px;
        border-left: 4px solid #667eea;
        padding: 20px;
        padding-bottom: 60px;
    `;
    
    // 例句
    const sentenceElement = document.createElement('div');
    sentenceElement.textContent = sentence;
    sentenceElement.style.cssText = `
        font-size: 18px;
        line-height: 1.8;
        color: #4a5568;
        text-align: left;
    `;

    // 播放按鈕
    const playButton = document.createElement('button');
    playButton.textContent = "▶";
    playButton.className = "btn btn-primary";
    playButton.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 10px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        padding: 0;
        font-size: 20px;
        line-height: 1;
    `;
    playButton.onclick = () => SpeechManager.speak(sentence, playButton);
    
    // 組裝
    sentenceContainer.appendChild(sentenceElement);
    sentenceContainer.appendChild(playButton);
    card.appendChild(closeButton);
    card.appendChild(wordElement);
    card.appendChild(divider);
    card.appendChild(sentenceContainer);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    
    // 點擊背景關閉
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            hideFlashcard();
        }
    });
    
    // ESC 鍵關閉
    const handleEscape = function(e) {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', handleEscape);
            hideFlashcard();
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    setTimeout(() => SpeechManager.speak(sentence, playButton), 500);
}

function hideFlashcard() {
    const overlay = document.querySelector('div[style*="position: fixed"][style*="z-index: 999"]');
    if (overlay) {
        overlay.remove();
        SpeechManager.cleanup();
        console.log("Flashcard closed and speech synthesis canceled.");
    }
}

// 加入動畫 CSS（只需要在第一次載入時加入）
if (!document.getElementById('flashcard-style')) {
    const style = document.createElement('style');
    style.id = 'flashcard-style';
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

