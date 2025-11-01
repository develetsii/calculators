import { Component, signal } from '@angular/core';
import { createOperators, Operator } from '../../classes/Operator';
import { createSpecialFunctions } from '../../classes/SpecialFunction';

interface Operation {
  operation: string;
  result: number;
}

@Component({
  selector: 'app-cientific-calculator',
  imports: [],
  templateUrl: './cientific-calculator.html',
  styleUrl: './cientific-calculator.css',
  standalone: true
})
export class CientificCalculatorComponent {
  protected readonly title = signal('calculator');
  operationDisplay: string = '';
  resultDisplay: string = '';
  history: Operation[] = [];
  lastAction: string = '';

  ngOnInit() {
    this.clearCalculator();
    this.clearDisplay();
  }

  //----------Display Methods----------//
  addToDisplay(value: string) {
    this.operationDisplay += value;
    this.lastAction = 'add';
  }

  clearDisplay() {
    this.operationDisplay = '';
  }

  throwError(error: string) {
    this.operationDisplay = error;
  }

  deleteLastCharacter() {
    this.operationDisplay = this.operationDisplay.slice(0, -1);
  }

  isLastCharacterNumber(): boolean {
    const lastChar = this.operationDisplay.slice(-1);
    return !isNaN(parseInt(lastChar));
  }

  isLastCharacterDot(): boolean {
    const lastChar = this.operationDisplay.slice(-1);
    return lastChar === '.';
  }

  isLastCharacterOperator(): boolean {
    const lastChar = this.operationDisplay.slice(-1);
    const operators = createOperators();
    return operators.some(op => op.shownAs === lastChar);
  }

  isLastCharacterLetter(): boolean {
    const lastChar = this.operationDisplay.slice(-1);
    return /[a-zA-Z]/.test(lastChar);
  }

  replaceDisplayWithAns() {
    this.operationDisplay = 'A';
  }


  isLastCharacterAns(): boolean {
    const lastChar = this.operationDisplay.slice(-1);
    return lastChar === 'A';
  }

  //----------Calculator Methods----------//
  replaceAllAnsWithHistory(operation: string): string {
    let updatedOperation = operation;
    let lastAns = this.history.length > 0
      ? this.history[this.history.length - 1].result.toString()
      : '0';

    updatedOperation = updatedOperation.replace(/A/g, lastAns);
    return updatedOperation;
  }

  replaceOperatorSymbols(operation: string): string {
    let updatedOperation = operation;
    const operators = createOperators();

    operators.forEach(op => {
      const regex = new RegExp(`\\${op.shownAs}`, 'g');
      updatedOperation = updatedOperation.replace(regex, op.symbol);
    });
    return updatedOperation;
  }

  replaceFunctionsNames(operation: string): string {
    const specialFunctions = createSpecialFunctions();
    let updatedOperation = operation;

    specialFunctions.forEach(func => {
      const regex = new RegExp(`\\${func.shownAs}`, 'g');
      updatedOperation = updatedOperation.replace(regex, func.math);
    });

    return updatedOperation;
  }


  calculateResult(): number {
    // Use Eval or a safer alternative to evaluate the expression
    let resultString :string = this.operationDisplay;
    let resultNumber: number;

    resultString = this.replaceAllAnsWithHistory(resultString);
    resultString = this.replaceOperatorSymbols(resultString);
    resultString = this.replaceFunctionsNames(resultString);

    resultString = eval(resultString);
    resultNumber = parseFloat(resultString);
    return resultNumber;
  }

  clearCalculator() {
    this.operationDisplay = '';
    this.resultDisplay = '';
  }

  //----------Animation Methods----------//
  triggerButtonAnimation(event: Event) {
    const button = event.target as HTMLElement;
    button.classList.remove('pressed');
    void button.offsetWidth; // Trigger reflow to restart the animation
    button.classList.add('pressed');
  }

  triggerButtonErrorAnimation(event: Event) {
    const button = event.target as HTMLElement;
    button.classList.remove('error');
    void button.offsetWidth; // Trigger reflow to restart the animation
    button.classList.add('error');
  }

  //----------Button Handlers----------//
  onNumberClick(event: Event, value: string) {
    if (this.isLastCharacterAns()) {
      this.triggerButtonErrorAnimation(event);
      return;
    }

    if (this.lastAction == 'equals') {
      this.clearCalculator();
    }

    this.addToDisplay(value);
    this.triggerButtonAnimation(event);
  }

  onSpecialCharClick(event: Event, value: string) {
    if (this.lastAction == 'equals') {
      this.clearCalculator();
    }

    if (value === 'Ans') {
      if (this.isLastCharacterNumber() || this.isLastCharacterDot()) {
        this.triggerButtonErrorAnimation(event);
        return;
      }

      this.addToDisplay("A");
      this.triggerButtonAnimation(event);
      return;
    }

    if (value === '.' && !this.isLastCharacterDot()) {
      this.addToDisplay('.');
      this.triggerButtonAnimation(event);
    }else {
      this.triggerButtonErrorAnimation(event);
    }
  }

  onOperatorClick(event: Event, value: string) {
    const actualOperator = createOperators().find(op => op.shownAs === value);

    if (!actualOperator) {
      this.triggerButtonErrorAnimation(event);
      return;
    }

    // Replace operator if last character is an operator
    if (this.isLastCharacterOperator()) {
      this.operationDisplay = this.operationDisplay.slice(0, -1) + actualOperator.shownAs;
      this.triggerButtonAnimation(event);
      return;
    }

    // If las action was equals, replace content with Ans
    if (this.lastAction === 'equals') {
      this.replaceDisplayWithAns();
    }

    this.triggerButtonAnimation(event);
    this.addToDisplay(actualOperator?.shownAs);
    this.lastAction = 'operator';
  }

  onFunctionClick(event: Event, func: string) {
    const actualFunction = createSpecialFunctions().find(op => op.shownAs === func);

    if (actualFunction) {
      this.operationDisplay += func;
      this.triggerButtonAnimation(event);
      return;
    }


    this.triggerButtonErrorAnimation(event);
  }

  onClearClick(event: Event) {
    this.clearDisplay();
    this.clearCalculator();
    this.lastAction = 'clear';
    this.triggerButtonAnimation(event);
  }

  onDeleteClick(event: Event) {
    if (this.operationDisplay.length === 0) {
      this.triggerButtonErrorAnimation(event);
      return;
    }

    this.lastAction = 'delete';

    this.deleteLastCharacter();
    this.triggerButtonAnimation(event);
  }

  onEqualsClick(event: Event) {
    let result: number;

    if (event.currentTarget !== null) {
      this.triggerButtonAnimation(event);
    }

    // Calculate result
    try {
      result = this.calculateResult();
    } catch (error) {
      console.error(error);
      this.clearCalculator();
      this.throwError('Sintax Error');
      return;
    }

    if (result != 0 && !result) {
      this.clearCalculator();
      this.throwError('Math error');
      return;
    }
    
    // Update display and actual number
    this.resultDisplay = result.toString();
    this.lastAction = 'equals';

    // Display result in console
    this.displayResultInConsole(
      result,
      this.operationDisplay
    );

    // Save operation to history
    this.history.push({
      operation: this.operationDisplay,
      result: result
    });
  }

  //----------Other Methods----------//
  displayResultInConsole(result: number, operation: string) {
    console.info(
      `%c📊 Resultado de %c${operation} %ces:%c ${result}`,
      "color: #ffffff; font-size: 14px;",                      // operador (texto)
      "color: #ffb300; font-weight: bold;",                    // valor 1
      "color: #ffffff; font-size: 14px;",                      // "es"
      "color: #00e676; font-weight: bold; font-size: 15px;"    // resultado final
    );
  }
}
