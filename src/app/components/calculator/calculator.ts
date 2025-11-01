import { Component, signal } from '@angular/core';
import { Calculator } from '../../classes/Calculator';
import { createOperators, Operator } from '../../classes/Operator';

interface Operation {
  value1: number;
  value2: number;
  operator: Operator;
  result: number;
}

@Component({
  selector: 'app-calculator',
  imports: [],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css',
  standalone: true
})
export class CalculatorComponent {
  protected readonly title = signal('calculator');
  screenDisplay: string = '';
  CALCULATOR: Calculator = new Calculator();
  OPERATORS: Operator[] = createOperators();
  history: Operation[] = [];

  numberTurn: 1 | 2 = 1;
  actualNumber: string = '';

  ngOnInit() {
    this.clearCalculator();
    this.clearDisplay();
  }

  //----------Display Methods----------//
  addToDisplay(value: string) {
    this.screenDisplay += value;
  }

  clearDisplay() {
    this.screenDisplay = '';
  }

  throwError(error: string) {
    this.screenDisplay = error;
  }

  deleteLastCharacter() {
    // If the last character deleted was an operator, switch turn back to number 1
    if (this.isLastCharacterOperator()) {
      this.numberTurn = 1;
      this.actualNumber = this.CALCULATOR.getValue1().toString();
      this.screenDisplay = this.screenDisplay.slice(0, -1);
      return;
    }

    this.screenDisplay = this.screenDisplay.slice(0, -1);
    this.actualNumber = this.actualNumber.slice(0, -1);
  }

  isLastCharacterNumber(): boolean {
    const lastChar = this.screenDisplay.slice(-1);
    return !isNaN(parseInt(lastChar));
  }

  isLastCharacterDot(): boolean {
    const lastChar = this.screenDisplay.slice(-1);
    return lastChar === '.';
  }

  isLastCharacterOperator(): boolean {
    const lastChar = this.screenDisplay.slice(-1);
    return this.OPERATORS.some(op => op.shownAs === lastChar);
  }

  isLastCharacterAns(): boolean {
    const lastChar = this.screenDisplay.slice(-1);
    return lastChar === 'A';
  }

  //----------Operator Methods----------//
  findOperatorBySymbol(symbol: string): Operator | null {
    return this.OPERATORS.find(op => op.symbol === symbol) || null;
  }

  findOperatorByShownAs(shownAs: string): Operator | null {
    return this.OPERATORS.find(op => op.shownAs === shownAs) || null;
  }

  //----------Calculator Methods----------//
  calculateResult(): number {
    const result = this.CALCULATOR.calculate();
    return result;
  }

  clearCalculator() {
    this.CALCULATOR.emptyValues();
    this.numberTurn = 1;
    this.actualNumber = '';
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

    this.addToDisplay(value);
    this.actualNumber += value;
    this.triggerButtonAnimation(event);
  }

  onSpecialCharClick(event: Event, value: string) {
    if (value === 'Ans') {
      if (this.actualNumber !== '' || this.isLastCharacterNumber() || this.isLastCharacterDot()) {
        this.triggerButtonErrorAnimation(event);
        return;
      }

      this.addToDisplay("A");
      this.actualNumber = this.history.length > 0
        ? this.history[this.history.length - 1].result.toString()
        : '0';
      this.triggerButtonAnimation(event);
      return;
    }

    if (value === '.' && !this.isLastCharacterDot() && this.actualNumber.indexOf('.') === -1) {
      this.addToDisplay('.');
      this.actualNumber += '.';
      this.triggerButtonAnimation(event);
    }else {
      this.triggerButtonErrorAnimation(event);
    }
  }

  onOperatorClick(event: Event, value: string) {
    const actualOperator: Operator | null = this.findOperatorByShownAs(value);

    if (actualOperator === null) {
      this.triggerButtonErrorAnimation(event);
      return;
    }

    // Replace operator if last character is an operator
    if (this.isLastCharacterOperator()) {
      this.screenDisplay = this.screenDisplay.slice(0, -1) + actualOperator.shownAs;
      this.CALCULATOR.setOperator(actualOperator);
      this.triggerButtonAnimation(event);
      return;
    }

    this.triggerButtonAnimation(event);

    // When the user wants to chain operations
    if (this.numberTurn === 2) {
      this.onEqualsClick(new Event('click', {}));
      this.actualNumber = '';

      this.addToDisplay(actualOperator?.shownAs);
      this.CALCULATOR.setOperator(actualOperator);
      this.numberTurn = 2;
      return;
    }

    this.addToDisplay(actualOperator?.shownAs);
    this.CALCULATOR.setOperator(actualOperator);

    this.CALCULATOR.setValue1(parseFloat(this.actualNumber));
    this.numberTurn = 2;
    this.actualNumber = '';
  }

  onClearClick(event: Event) {
    this.clearDisplay();
    this.clearCalculator();
    this.triggerButtonAnimation(event);
  }

  onDeleteClick(event: Event) {
    if (this.screenDisplay.length === 0) {
      this.triggerButtonErrorAnimation(event);
      return;
    }

    this.deleteLastCharacter();
    this.triggerButtonAnimation(event);
  }

  onEqualsClick(event: Event) {
    if (this.numberTurn === 1) {
      this.triggerButtonErrorAnimation(event);
      return;
    }

    let result: number;

    if (event.currentTarget !== null) {
      this.triggerButtonAnimation(event);
    }
    
    // Set value in calculator
    this.CALCULATOR.setValue2(parseFloat(this.actualNumber));

    // Calculate result
    try {
      result = this.calculateResult();
    } catch (error) {
      console.error(error);
      return;
    }

    if (result != 0 && !result) {
      this.clearCalculator();
      this.throwError('Math error');
      return;
    }
    
    // Update display and actual number
    this.screenDisplay = result.toString();
    this.actualNumber = result.toString();

    // Display result in console
    this.displayResultInConsole(
      result,
      this.CALCULATOR.operator!.verb,
      this.CALCULATOR.getValue1(),
      this.CALCULATOR.getValue2()
    );

    // Save operation to history
    this.history.push({
      value1: this.CALCULATOR.getValue1(),
      value2: this.CALCULATOR.getValue2(),
      operator: this.CALCULATOR.operator!,
      result: result
    });

    // Prepare calculator for next operation
    this.CALCULATOR.emptyValues();
    this.CALCULATOR.setValue1(result);

    this.numberTurn = 1;
  }

  //----------Other Methods----------//
  displayResultInConsole(result: number, operationVerb: string, value1: number, value2: number) {
    console.info(
      `%c📊 Resultado de ${operationVerb} %c${value1} %cy%c ${value2} %ces:%c ${result}`,
      "color: #ffffff; font-size: 14px;",                      // operador (texto)
      "color: #ffb300; font-weight: bold;",                    // valor 1
      "color: #aaa; font-size: 14px;",                         // la 'y'
      "color: #ffb300; font-weight: bold;",                    // valor 2
      "color: #ffffff; font-size: 14px;",                      // "es"
      "color: #00e676; font-weight: bold; font-size: 15px;"    // resultado final
    );
  }
}
