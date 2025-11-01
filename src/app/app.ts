import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Calculator } from './classes/Calculator';
import { createOperators, Operator } from './classes/Operator';
import { CalculatorComponent } from './components/calculator/calculator';
import { CientificCalculatorComponent } from './components/cientific-calculator/cientific-calculator';

interface Operation {
  value1: number;
  value2: number;
  operator: Operator;
  result: number;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CalculatorComponent, CientificCalculatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App {
  protected readonly title = signal('calculator');
  @ViewChild('calculatorTab') calculatorTabButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('historyTab') historyTabButton!: ElementRef<HTMLButtonElement>;

  activeTab: number = 1;
  lastEvent: Event | null = null;

  addActiveClass(button: HTMLButtonElement) {
    button.classList.add('active');
  }

  removeActiveClass(button: HTMLButtonElement) {
    button.classList.remove('active');
  }

  changeTab(tab: number) {
    this.activeTab = tab;
  }
}
