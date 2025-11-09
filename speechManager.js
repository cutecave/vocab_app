// 語音管理模組
const SpeechManager = {
    utterance: null,
    isPlaying: false,
    currentButton: null,
    
    // 播放文字
    speak(text, button, rate = 1.0) {
        // 如果正在播放，先停止
        if (this.isPlaying) {
            this.stop();
            return;
        }
        
        this.currentButton = button;
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.lang = 'en-US';
        this.utterance.rate = rate;
        
        // 開始播放時
        this.utterance.onstart = () => {
            this.isPlaying = true;
            this.updateButton('pause');
        };
        
        // 播放結束時
        this.utterance.onend = () => {
            this.isPlaying = false;
            this.updateButton('play');
        };
        
        // 播放錯誤時
        this.utterance.onerror = () => {
            this.isPlaying = false;
            this.updateButton('play');
            console.error('Speech synthesis error');
        };
        
        window.speechSynthesis.speak(this.utterance);
    },
    
    // 停止播放
    stop() {
        if (!this.isPlaying) return;
        
        // 先標記為已停止,避免 onerror 再次觸發
        this.isPlaying = false;
        
        // 移除事件監聽,避免 cancel 觸發 onerror
        if (this.utterance) {
            this.utterance.onend = null;
            this.utterance.onerror = null;
        }
        
        window.speechSynthesis.cancel();
        this.updateButton('play');
    },
    
    // 更新按鈕外觀
    updateButton(state) {
        if (!this.currentButton) return;
        
        if (state === 'play') {
            this.currentButton.textContent = '▶';
            this.currentButton.title = '播放';
        } else if (state === 'pause') {
            this.currentButton.textContent = '⏸';
            this.currentButton.title = '暫停';
        }
    },
    
    // 清理資源
    cleanup() {
        this.stop();
        this.currentButton = null;
        this.utterance = null;
    }
};