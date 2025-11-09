function showFlashcard(word, sentence) {
    const plane = document.createElement('div');
    plane.style.cssText = `
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0px;
        left: 0px;
        background: #e0e0e0;
        color: black;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000; /* 確保它在其他元素之上 */
    `;
    document.body.appendChild(plane);

    const wordElement = document.createElement('div');
    wordElement.textContent = word;
    plane.appendChild(wordElement);

    const sentenceElement = document.createElement('div');
    sentenceElement.textContent = sentence;
    plane.appendChild(sentenceElement);
    
    const closeButton = document.createElement('button');
    closeButton.textContent = "Close";
    closeButton.className = "btn btn-secondary";
    closeButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
    `;
    closeButton.onclick = () => plane.remove();
    plane.appendChild(closeButton);
}
