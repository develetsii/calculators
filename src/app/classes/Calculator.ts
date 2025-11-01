import type { Operator } from './Operator';

class Calculator {
    private currentValue: number = 0;
    private value1: number = 0;
    private value2: number = 0;
    public operator: Operator | null = null;

    getValue1(): number {
        return this.value1;
    }

    getValue2(): number {
        return this.value2;
    }

    setOperator(operator: Operator) {
        this.operator = operator;
    }

    setValue1(value: number) {
        if (isNaN(value)) {
            this.value1 = 0;
            return;
        }

        this.value1 = value;
    }

    setValue2(value: number) {
        if (isNaN(value)) {
            this.value2 = 0;
            return;
        }

        this.value2 = value;
    }

    emptyValues() {
        this.value1 = 0;
        this.value2 = 0;
        this.currentValue = 0;
        this.operator = null;
    }

    calculate(): number {
        if (this.operator === null) {
            throw new Error('Operator not set');
        }
        this.currentValue = this.operator.operate(this.value1, this.value2);
        return this.currentValue;
    }
}

export { Calculator };
export type { Operator };