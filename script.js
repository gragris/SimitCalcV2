class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement, historyListElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.historyListElement = historyListElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.updateDisplay();
    }

    delete() {
        if (this.shouldResetScreen) return;
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
        this.updateDisplay();
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        const equation = `${prev} ${this.operation} ${current}`;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    alert("Sıfıra bölünemez! 😱");
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            case '%':
                computation = prev % current;
                break;
            default:
                return;
        }

        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;

        // Add to history
        this.addHistory(equation, computation);
        this.updateDisplay();
    }

    addHistory(equation, result) {
        const item = document.createElement('div');
        item.classList.add('history-item');
        item.innerHTML = `
            <div class="history-equation">${equation}</div>
            <div class="history-result">= ${result}</div>
        `;
        item.onclick = () => {
            this.currentOperand = result.toString();
            this.shouldResetScreen = true;
            this.updateDisplay();
        };
        this.historyListElement.prepend(item);
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.currentOperand;
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.previousOperand} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');
const historyListElement = document.getElementById('history-list');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, historyListElement);

// Global functions for HTML onClick bindings
window.appendNumber = (number) => calculator.appendNumber(number);
window.appendOperator = (operator) => calculator.chooseOperation(operator);
window.clearDisplay = () => calculator.clear();
window.deleteLast = () => calculator.delete();
window.calculate = () => calculator.compute();

// Keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/[0-9]/.test(key)) calculator.appendNumber(key);
    if (key === '.') calculator.appendNumber('.');

    if (key === '+') calculator.chooseOperation('+');
    if (key === '-') calculator.chooseOperation('-');
    if (key === '*') calculator.chooseOperation('*');
    if (key === '/') calculator.chooseOperation('÷');
    if (key === '%') calculator.chooseOperation('%');

    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculator.compute();
    }
    if (key === 'Backspace') calculator.delete();
    if (key === 'Escape') calculator.clear();
});

// Clear History
document.getElementById('clear-history').addEventListener('click', () => {
    historyListElement.innerHTML = '';
});

// Window Controls (Electron)
const { ipcRenderer } = require('electron');

if (ipcRenderer) {
    document.querySelector('.close').addEventListener('click', () => {
        ipcRenderer.send('close-window');
    });

    document.querySelector('.minimize').addEventListener('click', () => {
        ipcRenderer.send('minimize-window');
    });

    document.querySelector('.maximize').addEventListener('click', () => {
        ipcRenderer.send('maximize-window');
    });
}
