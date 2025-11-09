// 接受第二個參數 type (例如 'success' 或 'error')
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    
    // 根據 type 設定不同的顏色
    let bgColor = (type === 'error') ? '#e53e3e' : '#48bb78'; // 錯誤用紅色
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor}; // 使用動態顏色
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000; /* 確保它在其他元素之上 */
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
